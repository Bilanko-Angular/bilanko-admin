import { NotificationResponseDTO } from '../models/DTO/notifications/NotificationDto';
import { NotificationItem } from '../models/notification/notificationItem';

export type MappedNotification = NotificationItem & {
  read: boolean;
  referenceId: number | null;
  actionLink: string | null;
  originalType: string;
};

export class NotificationMapper {
  static toClient(dto: NotificationResponseDTO): MappedNotification {
    let type: NotificationItem['type'] = 'systeme';

    if (dto.type === 'NEW_SALE') {
      type = 'vente';
    } else if (
      dto.type === 'SUPPORT_CLAIM_REQUEST' ||
      dto.type === 'SUPPORT_TRANSFER_REQUEST' ||
      dto.type === 'SUPPORT_NEW_MESSAGE'
    ) {
      type = 'support';
    }

    let timeStr = '';
    try {
      const date = new Date(dto.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.round(diffMs / 60000);
      const diffHours = Math.round(diffMins / 60);
      const diffDays = Math.round(diffHours / 24);

      if (diffMins < 1) {
        timeStr = "À l'instant";
      } else if (diffMins < 60) {
        timeStr = `Il y a ${diffMins} min`;
      } else if (diffHours < 24) {
        timeStr = `Il y a ${diffHours} h`;
      } else if (diffDays === 1) {
        timeStr = 'Hier';
      } else if (diffDays < 7) {
        timeStr = `Il y a ${diffDays} jours`;
      } else {
        timeStr = new Intl.DateTimeFormat('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(date);
      }
    } catch {
      timeStr = dto.createdAt;
    }

    return {
      id: dto.id.toString(),
      title: dto.title,
      detail: dto.message,
      time: timeStr,
      type,
      read: dto.read,
      referenceId: dto.referenceId,
      actionLink: dto.actionLink ?? null,
      originalType: dto.type,
    };
  }
}
