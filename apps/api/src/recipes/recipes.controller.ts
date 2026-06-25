import {
  Body,
  Controller,
  Get,
  Param,
  ParseFloatPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@kitchenos/db';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/recipe.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  findAll(
    @Query('departmentId') departmentId?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.recipesService.findAll({ departmentId, category, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  // Staff use the calculator constantly; everyone can view/scale, nobody but
  // Admin/Super Admin can create or mutate a recipe.
  @Get(':id/scale')
  scale(@Param('id') id: string, @Query('portions', ParseFloatPipe) portions: number) {
    return this.recipesService.scale(id, portions);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post()
  create(@Body() dto: CreateRecipeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.recipesService.create(dto, user.userId);
  }
}
