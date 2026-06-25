import { Injectable, Logger } from '@nestjs/common';
import {
  NotificationChannelHandler,
  NotificationPayload,
} from '../interfaces/notification-channel.interface';

/**
 * No-op stand-in for Firebase Cloud Messaging. Replace with the firebase-admin
 * messaging SDK once a Firebase service account is configured.
 */
@Injectable()
export class PushChannel implements NotificationChannelHandler {
  readonly channel = 'PUSH' as const;
  private readonly logger = new Logger(PushChannel.name);

  async send(payload: NotificationPayload) {
    this.logger.log(`[stub] Push notification not sent (no FCM credentials configured): ${payload.title}`);
    return { success: false };
  }
}
