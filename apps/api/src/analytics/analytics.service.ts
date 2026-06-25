import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ASSISTANT_PROVIDER, AssistantProvider } from '../ai/interfaces/assistant-provider.interface';

const TREND_DAYS = 14;

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ASSISTANT_PROVIDER) private readonly assistant: AssistantProvider,
  ) {}

  async getSummary() {
    const since = new Date();
    since.setDate(since.getDate() - TREND_DAYS);
    since.setHours(0, 0, 0, 0);

    const [inspections, tasks, attendance] = await Promise.all([
      this.prisma.qualityInspection.findMany({
        where: { createdAt: { gte: since } },
        select: { overallScore: true, createdAt: true },
      }),
      this.prisma.task.findMany({
        where: { createdAt: { gte: since } },
        select: { status: true, createdAt: true },
      }),
      this.prisma.attendanceEvent.findMany({
        where: { type: 'PUNCH_IN', occurredAt: { gte: since } },
        select: { isLate: true, occurredAt: true },
      }),
    ]);

    const qualityTrend = this.bucketByDay(since, inspections, (rows) => {
      const scores = rows.map((r) => r.overallScore).filter((s): s is number => s !== null);
      return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    }, (r) => r.createdAt);

    const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
    const taskCompletionRate = tasks.length ? completedCount / tasks.length : null;

    const lateCount = attendance.filter((a) => a.isLate).length;
    const punctualityRate = attendance.length ? 1 - lateCount / attendance.length : null;

    return {
      periodDays: TREND_DAYS,
      qualityTrend,
      taskCompletionRate,
      punctualityRate,
      sampleSizes: { inspections: inspections.length, tasks: tasks.length, attendanceEvents: attendance.length },
    };
  }

  async ask(question: string) {
    const context = await this.getSummary();
    return this.assistant.ask(question, context);
  }

  private bucketByDay<T>(
    since: Date,
    rows: T[],
    aggregate: (rows: T[]) => number | null,
    dateOf: (row: T) => Date,
  ) {
    const buckets = new Map<string, T[]>();
    for (let i = 0; i < TREND_DAYS; i++) {
      const day = new Date(since);
      day.setDate(day.getDate() + i);
      buckets.set(day.toISOString().slice(0, 10), []);
    }
    for (const row of rows) {
      const key = dateOf(row).toISOString().slice(0, 10);
      buckets.get(key)?.push(row);
    }
    return Array.from(buckets.entries()).map(([date, dayRows]) => ({
      date,
      value: aggregate(dayRows),
    }));
  }
}
