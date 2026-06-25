export interface NotificationPayload {
  title: string;
  body: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export const NOTIFICATION_CHANNEL_HANDLERS = 'NOTIFICATION_CHANNEL_HANDLERS';

export interface NotificationChannelHandler {
  readonly channel: 'IN_APP' | 'PUSH' | 'EMAIL' | 'WHATSAPP';
  send(payload: NotificationPayload): Promise<{ success: boolean }>;
}
