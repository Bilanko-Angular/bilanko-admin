import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import {NotificationApiService} from '../../api/notification/notification-api.service';
import {NotificationItem} from '../../../models/notification/notificationItem';
import {NotificationMapper} from '../../../mapper/NotificationMapper';


export type ExtendedNotificationItem = NotificationItem & { read: boolean, referenceId: number | null, originalType: string };

@Injectable({
  providedIn: 'root',
})
export class NotificationsStoreService implements OnDestroy {
  private readonly apiService = inject(NotificationApiService);

  private readonly _notifications = signal<ExtendedNotificationItem[]>([]);
  private readonly _unreadCount = signal<number>(0);
  private readonly _page = signal<number>(0);
  private readonly _hasMore = signal<boolean>(false);

  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly hasMore = this._hasMore.asReadonly();

  private eventSource: EventSource | null = null;

  constructor() {
    this.init().then(r => {});
  }

  private async init() {
    await this.loadInitialData();
    this.connectSSE();
  }

  private async loadInitialData() {
    try {
      const pageData = await this.apiService.getNotifications(0, 10);
      const mapped = pageData.content.map(n => NotificationMapper.toClient(n));
      this._notifications.set(mapped);
      this._hasMore.set(pageData.hasMore);
      this._page.set(pageData.page);

      const count = await this.apiService.getUnreadCount();
      this._unreadCount.set(count);
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  }

  async loadMore() {
    if (!this._hasMore()) return;
    try {
      const nextPage = this._page() + 1;
      const pageData = await this.apiService.getNotifications(nextPage, 10);
      const mapped = pageData.content.map(n => NotificationMapper.toClient(n));

      this._notifications.update(prev => [...prev, ...mapped]);
      this._hasMore.set(pageData.hasMore);
      this._page.set(pageData.page);
    } catch (error) {
      console.error('Failed to load more notifications', error);
    }
  }

  private connectSSE() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const url = this.apiService.getNotificationStreamUrl();
    this.eventSource = new EventSource(url);

    this.eventSource.addEventListener('connected', (event: MessageEvent) => {
      console.log('SSE connected:', event.data);
    });

    this.eventSource.addEventListener('notification', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        const newNotif = NotificationMapper.toClient(data);
        this._notifications.update(prev => [newNotif, ...prev]);
      } catch (e) {
        console.error('Failed to parse new notification', e);
      }
    });

    this.eventSource.addEventListener('unread-count', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data && typeof data.count === 'number') {
          this._unreadCount.set(data.count);
        }
      } catch (e) {
        console.error('Failed to parse unread count', e);
      }
    });

    this.eventSource.onerror = (error) => {
      console.error('SSE Error', error);
      // Optional: Handle reconnection logic if needed. EventSource typically reconnects automatically.
    };
  }

  async markAsRead(id: string) {
    try {
      await this.apiService.markAsRead(Number(id));
      this._notifications.update(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      // Note: The unread-count event will be fired by backend, so we don't strictly need to manually decrement,
      // but doing it here could make it feel more responsive if SSE is slow.
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  }

  async markAllAsRead() {
    try {
      await this.apiService.markAllAsRead();
      this._notifications.update(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      this._unreadCount.set(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  }

  ngOnDestroy() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
