import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PunchDto } from './dto/attendance.dto';
import { FACE_RECOGNITION_PROVIDER, FaceRecognitionProvider } from '../ai/interfaces/face-recognition-provider.interface';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    @Inject(FACE_RECOGNITION_PROVIDER)
    private readonly faceRecognition: FaceRecognitionProvider,
  ) {}

  async punch(dto: PunchDto, ipAddress?: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
      include: { shift: true },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const occurredAt = new Date();
    let isLate = false;
    let isEarly = false;

    if (employee.shift) {
      if (dto.type === 'PUNCH_IN') {
        isLate = this.minutesPastDeadline(occurredAt, employee.shift.startTime, employee.shift.gracePeriodMinutes) > 0;
      }
      if (dto.type === 'PUNCH_OUT') {
        isEarly = this.minutesPastDeadline(occurredAt, employee.shift.endTime, 0) < 0;
      }
    }

    const event = await this.prisma.attendanceEvent.create({
      data: {
        employeeId: dto.employeeId,
        type: dto.type,
        photoUrl: dto.photoUrl,
        gpsLat: dto.gpsLat,
        gpsLng: dto.gpsLng,
        ipAddress,
        device: dto.device,
        isLate,
        isEarly,
      },
    });

    if (isLate) {
      await this.notifications.dispatch({
        title: 'Late punch-in',
        body: `${employee.name} punched in late.`,
        channels: ['IN_APP', 'PUSH', 'WHATSAPP'],
      });
    }

    return event;
  }

  /** Positive minutes => occurred after the deadline (incl. grace period). */
  private minutesPastDeadline(occurredAt: Date, hhmm: string, graceMinutes: number): number {
    const [hours, minutes] = hhmm.split(':').map(Number);
    const deadline = new Date(occurredAt);
    deadline.setHours(hours, minutes + graceMinutes, 0, 0);
    return Math.round((occurredAt.getTime() - deadline.getTime()) / 60000);
  }

  recognize(photoUrl: string) {
    return this.faceRecognition.recognize(photoUrl);
  }

  findForEmployee(employeeId: string, from?: Date, to?: Date) {
    return this.prisma.attendanceEvent.findMany({
      where: {
        employeeId,
        occurredAt: from || to ? { gte: from, lte: to } : undefined,
      },
      orderBy: { occurredAt: 'desc' },
    });
  }
}
