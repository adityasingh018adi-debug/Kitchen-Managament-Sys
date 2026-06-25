import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NOTIFICATION_CHANNEL_HANDLERS } from './interfaces/notification-channel.interface';
import { InAppChannel } from './channels/in-app.channel';
import { PushChannel } from './channels/push.channel';
import { WhatsAppChannel } from './channels/whatsapp.channel';

@Module({
  providers: [
    NotificationsService,
    InAppChannel,
    PushChannel,
    WhatsAppChannel,
    {
      provide: NOTIFICATION_CHANNEL_HANDLERS,
      useFactory: (inApp: InAppChannel, push: PushChannel, whatsapp: WhatsAppChannel) => [
        inApp,
        push,
        whatsapp,
      ],
      inject: [InAppChannel, PushChannel, WhatsAppChannel],
    },
  ],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
