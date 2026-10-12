import { Injectable } from '@angular/core';
import {environment} from '../../../../environments/environment';
import {apiClient} from '../../../core/axios/axios.config';
import {NotificationPageDTO} from '../../../models/DTO/notifications/NotificationDto';

@Injectable({
  providedIn: 'root',
})
export class NotificationApiService {
  private readonly basePath = environment.baseApiUrl + '/notifications';

  async getNotifications(page: number = 0, size: number = 10): Promise<NotificationPageDTO> {
    const response = await apiClient.get<NotificationPageDTO>(this.basePath, {
      params: { page, size }
    });
    return response.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number } | number>(
      `${this.basePath}/unread-count`,
    );
    const data = response.data;
    return typeof data === 'number' ? data : data.count;
  }

  async markAsRead(id: number): Promise<void> {
    await apiClient.put(`${this.basePath}/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.put(`${this.basePath}/read-all`);
  }

  getNotificationStreamUrl(): string {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('bilanko_jwt_token') : '';
    // Append token to url since EventSource doesn't support headers
    return `${this.basePath}/stream?token=${token}`;
  }
}
