import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { InventoryUnit } from '@kitchenos/db';

const UNITS: InventoryUnit[] = ['G', 'KG', 'ML', 'L', 'PCS', 'DOZEN', 'BOX'];

export class RecipeIngredientDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsIn(UNITS)
  unit: InventoryUnit;
}

export class CreateRecipeDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  departmentId: string;

  @IsString()
  method: string;

  @IsOptional()
  @IsString()
  cookingTemp?: string;

  @IsOptional()
  @IsNumber()
  cookingTimeMinutes?: number;

  @IsOptional()
  @IsString()
  shelfLife?: string;

  @IsOptional()
  @IsString()
  storageMethod?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  portionSize?: string;

  @IsNumber()
  @IsPositive()
  batchSize: number;

  @IsOptional()
  @IsString()
  yieldUnit?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsArray()
  galleryUrls?: string[];

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients: RecipeIngredientDto[];
}
