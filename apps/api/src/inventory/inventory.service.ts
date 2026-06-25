import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InventoryMovementType } from '@kitchenos/db';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AdjustStockDto, CreateInventoryItemDto, UpdateInventoryItemDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll() {
    const items = await this.prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
    return items.map((item) => ({
      ...item,
      isLowStock: Number(item.quantityOnHand) <= Number(item.reorderLevel),
    }));
  }

  create(dto: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({
      data: { name: dto.name, unit: dto.unit, reorderLevel: dto.reorderLevel },
    });
  }

  async update(id: string, dto: UpdateInventoryItemDto) {
    await this.ensureExists(id);
    return this.prisma.inventoryItem.update({ where: { id }, data: dto });
  }

  async adjustStock(id: string, dto: AdjustStockDto, actorId: string) {
    const item = await this.ensureExists(id);
    const delta = dto.type === InventoryMovementType.STOCK_IN ? dto.quantity : -dto.quantity;
    const newQuantity = Number(item.quantityOnHand) + delta;
    if (newQuantity < 0) {
      throw new BadRequestException('Stock-out exceeds quantity on hand');
    }

    const [, movement] = await this.prisma.$transaction([
      this.prisma.inventoryItem.update({
        where: { id },
        data: { quantityOnHand: newQuantity },
      }),
      this.prisma.inventoryMovement.create({
        data: { itemId: id, type: dto.type, quantity: dto.quantity, reason: dto.reason, userId: actorId },
      }),
    ]);

    await this.audit.log({
      action: dto.type === InventoryMovementType.STOCK_IN ? 'INVENTORY_STOCK_IN' : 'INVENTORY_STOCK_OUT',
      entity: 'InventoryItem',
      entityId: id,
      userId: actorId,
      metadata: { quantity: dto.quantity, reason: dto.reason },
    });

    return movement;
  }

  movementHistory(id: string) {
    return this.prisma.inventoryMovement.findMany({
      where: { itemId: id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true } } },
    });
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Inventory item not found');
    return item;
  }
}
