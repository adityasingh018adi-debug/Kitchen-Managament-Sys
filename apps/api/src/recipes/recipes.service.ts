import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@kitchenos/db';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateRecipeDto } from './dto/recipe.dto';

export interface ScaledIngredient {
  name: string;
  unit: string;
  originalQuantity: number;
  scaledQuantity: number;
}

export interface ScaledRecipe {
  recipeId: string;
  recipeName: string;
  originalBatchSize: number;
  requestedPortions: number;
  scaleFactor: number;
  yieldUnit: string;
  ingredients: ScaledIngredient[];
}

@Injectable()
export class RecipesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll(params: { departmentId?: string; category?: string; search?: string }) {
    const where: Prisma.RecipeWhereInput = {
      departmentId: params.departmentId,
      category: params.category,
      name: params.search ? { contains: params.search, mode: 'insensitive' } : undefined,
    };
    return this.prisma.recipe.findMany({
      where,
      include: { department: true, ingredients: true },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.recipe.findUniqueOrThrow({
      where: { id },
      include: { department: true, ingredients: true },
    });
  }

  async create(dto: CreateRecipeDto, actorId: string) {
    const recipe = await this.prisma.recipe.create({
      data: {
        name: dto.name,
        category: dto.category,
        departmentId: dto.departmentId,
        method: dto.method,
        cookingTemp: dto.cookingTemp,
        cookingTimeMinutes: dto.cookingTimeMinutes,
        shelfLife: dto.shelfLife,
        storageMethod: dto.storageMethod,
        notes: dto.notes,
        portionSize: dto.portionSize,
        batchSize: dto.batchSize,
        yieldUnit: dto.yieldUnit ?? 'portion',
        photoUrl: dto.photoUrl,
        galleryUrls: dto.galleryUrls ?? [],
        videoUrl: dto.videoUrl,
        createdById: actorId,
        ingredients: {
          create: dto.ingredients.map((ingredient) => ({
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
          })),
        },
      },
      include: { ingredients: true },
    });

    await this.audit.log({
      action: 'RECIPE_CREATED',
      entity: 'Recipe',
      entityId: recipe.id,
      userId: actorId,
    });

    return recipe;
  }

  /**
   * Smart Recipe Calculator: scales every ingredient quantity from the
   * recipe's reference batch size to the staff-requested portion count.
   * scaledQuantity = originalQuantity * (requestedPortions / originalBatchSize)
   */
  async scale(recipeId: string, requestedPortions: number): Promise<ScaledRecipe> {
    if (requestedPortions <= 0) {
      throw new BadRequestException('requestedPortions must be greater than 0');
    }

    const recipe = await this.prisma.recipe.findUniqueOrThrow({
      where: { id: recipeId },
      include: { ingredients: true },
    });

    const originalBatchSize = Number(recipe.batchSize);
    const scaleFactor = requestedPortions / originalBatchSize;

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      originalBatchSize,
      requestedPortions,
      scaleFactor,
      yieldUnit: recipe.yieldUnit,
      ingredients: recipe.ingredients.map((ingredient) => {
        const originalQuantity = Number(ingredient.quantity);
        return {
          name: ingredient.name,
          unit: ingredient.unit,
          originalQuantity,
          scaledQuantity: Math.round(originalQuantity * scaleFactor * 1000) / 1000,
        };
      }),
    };
  }
}
