import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto, UpdateUserDto } from './dto/admin.dto';

const USER_SELECT = {
  id: true,
  username: true,
  role: true,
  isActive: true,
  twoFactorEnabled: true,
  lastLoginAt: true,
  createdAt: true,
};

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  listUsers() {
    return this.prisma.user.findMany({ select: USER_SELECT, orderBy: { createdAt: 'asc' } });
  }

  async createUser(dto: CreateUserDto, actorId: string) {
    const existing = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (existing) throw new BadRequestException('Username already taken');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { username: dto.username, passwordHash, role: dto.role },
      select: USER_SELECT,
    });
    await this.audit.log({ action: 'USER_CREATED', entity: 'User', entityId: user.id, userId: actorId, metadata: { role: dto.role } });
    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto, actorId: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { role: dto.role, isActive: dto.isActive },
      select: USER_SELECT,
    });
    await this.audit.log({ action: 'USER_UPDATED', entity: 'User', entityId: user.id, userId: actorId, metadata: { ...dto } });
    return user;
  }

  auditLogs(params: { entity?: string; action?: string; from?: Date; to?: Date }) {
    return this.prisma.auditLog.findMany({
      where: {
        entity: params.entity,
        action: params.action,
        createdAt: params.from || params.to ? { gte: params.from, lte: params.to } : undefined,
      },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
