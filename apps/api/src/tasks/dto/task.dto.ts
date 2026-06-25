import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { TaskPriority } from '@kitchenos/db';

const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  departmentId: string;

  @IsOptional()
  @IsString()
  recipeId?: string;

  @IsOptional()
  @IsIn(PRIORITIES)
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => String)
  employeeIds: string[];
}

export class FinishTaskDto {
  @IsString()
  proofPhotoUrl: string;
}
