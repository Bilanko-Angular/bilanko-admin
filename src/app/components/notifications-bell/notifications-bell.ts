import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  ExtendedNotificationItem,
  NotificationsStoreService,
} from '../../service/store/notifications/notifications-store.service';
import { SupportMessagingStoreService } from '../../service/store/support/support-messaging-store.service';

@Component({
  selector: 'app-notifications-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-bell.html',
  styleUrl:'notifications-bell.css',
})
export class NotificationsBell {
  private readonly store = inject(NotificationsStoreService);
  private readonly supportStore = inject(SupportMessagingStoreService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  open = signal(false);
  processingId = signal<string | null>(null);
  actionError = signal<string | null>(null);

  readonly notifications = this.store.notifications;
  readonly unreadCount = this.store.unreadCount;
  readonly hasMore = this.store.hasMore;

  toggle() {
    this.open.update((v) => !v);
    this.actionError.set(null);
  }

  async onNotificationClick(notif: ExtendedNotificationItem) {
    if (this.processingId()) return;

    this.actionError.set(null);
    if (!notif.read) {
      await this.store.markAsRead(notif.id);
    }

    switch (notif.originalType) {
      case 'SUPPORT_CLAIM_REQUEST':
      case 'SUPPORT_TRANSFER_REQUEST':
        await this.handleClaim(notif);
        return;
      case 'SUPPORT_NEW_MESSAGE':
        this.open.set(false);
        if (notif.referenceId != null) {
          await this.router.navigate(['/messaging'], {
            queryParams: { conversationId: notif.referenceId },
          });
        }
        return;
      default:
        this.open.set(false);
    }
  }

  private async handleClaim(notif: ExtendedNotificationItem) {
    const token = this.extractClaimToken(notif.actionLink);
    if (!token) {
      this.actionError.set('Lien de prise en main invalide');
      return;
    }

    this.processingId.set(notif.id);
    try {
      const conversation = await this.supportStore.claim(token);
      if (!conversation) {
        this.actionError.set(this.supportStore.error() ?? 'Impossible de prendre la conversation');
        return;
      }

      this.open.set(false);
      await this.router.navigate(['/messaging'], {
        queryParams: { conversationId: conversation.id },
      });
    } finally {
      this.processingId.set(null);
    }
  }

  private extractClaimToken(actionLink: string | null): string | null {
    if (!actionLink) return null;
    const match = actionLink.match(/\/support\/claim\/([^/?#]+)/i);
    return match?.[1] ?? null;
  }

  async markAllAsRead() {
    await this.store.markAllAsRead();
  }

  async loadMore() {
    await this.store.loadMore();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.open.set(false);
    }
  }
}
