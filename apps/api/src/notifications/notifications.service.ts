import { Inject, Injectable } from '@nestjs/common';
import { NotificationChannel } from '@kitchenos/db';
import { PrismaService } from '../common/prisma.service';
import {
  NOTIFICATION_CHANNEL_HANDLERS,
  NotificationChannelHandler,
  NotificationPayload,
} from './interfaces/notification-channel.interface';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(NOTIFICATION_CHANNEL_HANDLERS)
    private readonly handlers: NotificationChannelHandler[],
  ) {}

  async dispatch(params: NotificationPayload & { channels: NotificationChannel[] }) {
    const results = await Promise.all(
      params.channels.map(async (channel) => {
        const handler = this.handlers.find((h) => h.channel === channel);
        const outcome = handler ? await handler.send(params) : { success: false };

        return this.prisma.notification.create({
          data: {
            channel,
            status: outcome.success ? 'SENT' : 'FAILED',
            title: params.title,
            body: params.body,
            userId: params.userId,
            metadata: params.metadata as any,
            sentAt: outcome.success ? new Date() : undefined,
          },
        });
      }),
    );
    return results;
  }

  findForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  findByChannel(channel: NotificationChannel) {
    return this.prisma.notification.findMany({
      where: { channel },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
