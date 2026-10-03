import {NotificationResponseDTO} from '../models/DTO/notifications/NotificationDto';
import {NotificationItem} from '../models/notification/notificationItem';


export class NotificationMapper {
  static toClient(dto: NotificationResponseDTO): NotificationItem & { read: boolean, referenceId: number | null, originalType: string } {
    let type: 'stock' | 'vente' | 'systeme' = 'systeme';

    if (dto.type === 'NEW_SALE') {
      type = 'vente';
    } else if (dto.type === 'NEW_CHARGE') {
      type = 'systeme';
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
        timeStr = 'À l\'instant';
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
          year: 'numeric'
        }).format(date);
      }
    } catch (e) {
      timeStr = dto.createdAt;
    }

    return {
      id: dto.id.toString(),
      title: dto.title,
      detail: dto.message,
      time: timeStr,
      type: type,
      read: dto.read,
      referenceId: dto.referenceId,
      originalType: dto.type
    };
  }
}
