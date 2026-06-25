import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateDepartmentDto, UpdatePinDto } from './dto/department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll() {
    return this.prisma.department.findMany({
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
  }

  async create(dto: CreateDepartmentDto, actorId: string) {
    const pinHash = await bcrypt.hash(dto.pin, 10);
    const department = await this.prisma.department.create({
      data: { name: dto.name, pinHash },
    });
    await this.audit.log({
      action: 'DEPARTMENT_CREATED',
      entity: 'Department',
      entityId: department.id,
      userId: actorId,
    });
    return department;
  }

  // PIN can only be changed by Admin/Super Admin (enforced by RolesGuard at the controller).
  async updatePin(id: string, dto: UpdatePinDto, actorId: string) {
    const pinHash = await bcrypt.hash(dto.pin, 10);
    await this.prisma.department.update({ where: { id }, data: { pinHash } });
    await this.audit.log({
      action: 'DEPARTMENT_PIN_CHANGED',
      entity: 'Department',
      entityId: id,
      userId: actorId,
    });
    return { success: true };
  }

  async verifyPin(id: string, pin: string) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) return false;
    return bcrypt.compare(pin, department.pinHash);
  }
}
