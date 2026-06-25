import { Injectable, Logger } from '@nestjs/common';
import {
  NotificationChannelHandler,
  NotificationPayload,
} from '../interfaces/notification-channel.interface';

/**
 * No-op stand-in for the WhatsApp Cloud API. Logs instead of calling out
 * to Meta's Graph API — wire WHATSAPP_TOKEN/WHATSAPP_PHONE_ID env vars and
 * replace the body of send() with a real fetch() call once a WhatsApp
 * Business account is available.
 */
@Injectable()
export class WhatsAppChannel implements NotificationChannelHandler {
  readonly channel = 'WHATSAPP' as const;
  private readonly logger = new Logger(WhatsAppChannel.name);

  async send(payload: NotificationPayload) {
    this.logger.log(`[stub] WhatsApp message not sent (no credentials configured): ${payload.title}`);
    return { success: false };
  }
}
