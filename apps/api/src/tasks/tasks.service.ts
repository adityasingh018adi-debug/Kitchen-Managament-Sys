import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TaskStatus } from '@kitchenos/db';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../audit/audit.service';
import { VISION_PROVIDER, VisionProvider } from '../ai/interfaces/vision-provider.interface';
import { CreateTaskDto, FinishTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @Inject(VISION_PROVIDER) private readonly visionProvider: VisionProvider,
  ) {}

  findAll(params: { departmentId?: string; status?: TaskStatus; employeeId?: string }) {
    const where: Prisma.TaskWhereInput = {
      departmentId: params.departmentId,
      status: params.status,
      assignments: params.employeeId ? { some: { employeeId: params.employeeId } } : undefined,
    };
    return this.prisma.task.findMany({
      where,
      include: { department: true, recipe: true, assignments: { include: { employee: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateTaskDto, actorId: string) {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        departmentId: dto.departmentId,
        recipeId: dto.recipeId,
        priority: dto.priority ?? 'MEDIUM',
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        createdById: actorId,
        assignments: {
          create: dto.employeeIds.map((employeeId) => ({ employeeId })),
        },
      },
      include: { assignments: { include: { employee: true } } },
    });

    await this.audit.log({
      action: 'TASK_CREATED',
      entity: 'Task',
      entityId: task.id,
      userId: actorId,
    });

    // TODO: dispatch via NotificationsService (push/WhatsApp) once a task is assigned.
    return task;
  }

  async start(taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.status !== 'PENDING') {
      throw new BadRequestException('Only pending tasks can be started');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: { status: 'WORKING', startedAt: new Date() },
    });
  }

  async finish(taskId: string, dto: FinishTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId }, include: { recipe: true } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.status !== 'WORKING') {
      throw new BadRequestException('Only in-progress tasks can be finished');
    }

    const finishedAt = new Date();

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: { status: 'COMPLETED', finishedAt, proofPhotoUrl: dto.proofPhotoUrl },
    });

    // AI Food Quality Inspection runs automatically against the photo proof.
    const inspection = await this.visionProvider.inspectFood(
      dto.proofPhotoUrl,
      task.recipe?.name ?? task.title,
    );

    await this.prisma.qualityInspection.create({
      data: {
        photoUrl: dto.proofPhotoUrl,
        overallScore: inspection.overallScore,
        presentationScore: inspection.presentationScore,
        accuracyScore: inspection.accuracyScore,
        suggestions: inspection.suggestions,
        rawProviderResponse: inspection.raw as any,
        taskId: task.id,
        recipeId: task.recipeId,
      },
    });

    return { task: updated, inspection };
  }

  totalTimeMs(task: { startedAt: Date | null; finishedAt: Date | null }) {
    if (!task.startedAt || !task.finishedAt) return null;
    return task.finishedAt.getTime() - task.startedAt.getTime();
  }
}
