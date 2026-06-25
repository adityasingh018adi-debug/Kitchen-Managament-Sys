import { Injectable, Logger } from '@nestjs/common';
import {
  NotificationChannelHandler,
  NotificationPayload,
} from '../interfaces/notification-channel.interface';

/** Real channel — notifications are persisted and read by the web app. */
@Injectable()
export class InAppChannel implements NotificationChannelHandler {
  readonly channel = 'IN_APP' as const;
  private readonly logger = new Logger(InAppChannel.name);

  async send(payload: NotificationPayload) {
    this.logger.log(`In-app notification queued: ${payload.title}`);
    return { success: true };
  }
}
