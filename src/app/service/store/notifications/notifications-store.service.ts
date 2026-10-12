import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import { NotificationApiService } from '../../api/notification/notification-api.service';
import { MappedNotification, NotificationMapper } from '../../../mapper/NotificationMapper';

export type ExtendedNotificationItem = MappedNotification;

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
    void this.init();
  }

  private async init() {
    await this.loadInitialData();
    this.connectSSE();
  }

  private async loadInitialData() {
    try {
      const pageData = await this.apiService.getNotifications(0, 10);
      const mapped = pageData.content.map((n) => NotificationMapper.toClient(n));
      this._notifications.set(mapped);
      this._hasMore.set(pageData.hasMore);
      this._page.set(pageData.page);

      const count = pageData.unreadCount ?? (await this.apiService.getUnreadCount());
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
      const mapped = pageData.content.map((n) => NotificationMapper.toClient(n));

      this._notifications.update((prev) => [...prev, ...mapped]);
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
        this._notifications.update((prev) => {
          if (prev.some((n) => n.id === newNotif.id)) return prev;
          return [newNotif, ...prev];
        });
      } catch (e) {
        console.error('Failed to parse new notification', e);
      }
    });

    this.eventSource.addEventListener('notification-deleted', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as { id: number };
        const id = String(data.id);
        this._notifications.update((prev) => prev.filter((n) => n.id !== id));
      } catch (e) {
        console.error('Failed to parse deleted notification', e);
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
    };
  }

  async markAsRead(id: string) {
    const target = this._notifications().find((n) => n.id === id);
    if (!target || target.read) return;

    try {
      await this.apiService.markAsRead(Number(id));
      this._notifications.update((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      this._unreadCount.update((count) => Math.max(0, count - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  }

  async markAllAsRead() {
    try {
      await this.apiService.markAllAsRead();
      this._notifications.update((prev) => prev.map((n) => ({ ...n, read: true })));
      this._unreadCount.set(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  }

  removeLocally(id: string) {
    this._notifications.update((prev) => prev.filter((n) => n.id !== id));
  }

  ngOnDestroy() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
