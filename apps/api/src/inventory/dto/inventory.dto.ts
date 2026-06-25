import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { InventoryUnit, InventoryMovementType } from '@kitchenos/db';

export class CreateInventoryItemDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(InventoryUnit)
  unit!: InventoryUnit;

  @IsNumber()
  @IsPositive()
  reorderLevel!: number;
}

export class UpdateInventoryItemDto {
  @IsOptional()
  @IsEnum(InventoryUnit)
  unit?: InventoryUnit;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  reorderLevel?: number;
}

export class AdjustStockDto {
  @IsEnum(InventoryMovementType)
  type!: InventoryMovementType;

  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
