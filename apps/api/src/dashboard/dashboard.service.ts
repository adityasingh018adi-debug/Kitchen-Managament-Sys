import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      tasksToday,
      completedTasksToday,
      lateAttendanceToday,
      pendingTasksCount,
      qualityAggregate,
    ] = await Promise.all([
      this.prisma.task.count({ where: { createdAt: { gte: startOfDay } } }),
      this.prisma.task.count({
        where: { status: 'COMPLETED', finishedAt: { gte: startOfDay } },
      }),
      this.prisma.attendanceEvent.count({
        where: { type: 'PUNCH_IN', isLate: true, occurredAt: { gte: startOfDay } },
      }),
      this.prisma.task.count({ where: { status: 'PENDING' } }),
      this.prisma.qualityInspection.aggregate({
        where: { createdAt: { gte: startOfDay } },
        _avg: { overallScore: true },
      }),
    ]);

    return {
      tasksToday,
      completedTasksToday,
      lateAttendanceToday,
      pendingTasksCount,
      averageQualityScoreToday: qualityAggregate._avg.overallScore ?? null,
    };
  }
}
