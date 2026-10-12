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
  template: `
    <div class="position-relative">
      <button type="button" class="bk-header__action-btn" (click)="toggle()" title="Notifications">
        <span class="material-icons">notifications</span>
        @if (unreadCount() > 0) {
          <span
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style="font-size: 0.6rem;"
          >
            {{ unreadCount() > 99 ? '99+' : unreadCount() }}
          </span>
        }
      </button>

      @if (open()) {
        <div class="bk-notif-panel">
          <div class="p-2 border-bottom d-flex justify-content-between align-items-center">
            <strong class="small">Notifications</strong>
            @if (unreadCount() > 0) {
              <button
                class="btn btn-sm btn-link text-decoration-none p-0"
                (click)="markAllAsRead()"
              >
                Tout marquer lu
              </button>
            }
          </div>
          <div class="list-group list-group-flush" style="max-height: 250px; overflow-y: auto;">
            @for (notif of notifications(); track notif.id) {
              <button
                type="button"
                class="list-group-item list-group-item-action d-flex gap-2 align-items-start text-start"
                [class.bk-notif--unread]="!notif.read"
                [disabled]="processingId() === notif.id"
                (click)="onNotificationClick(notif)"
              >
                <span
                  class="material-icons"
                  [class.text-primary]="!notif.read"
                  [class.text-muted]="notif.read"
                  style="font-size: 0.8rem;"
                  >circle</span
                >
                <div>
                  <div class="fw-semibold small">{{ notif.title }}</div>
                  <div class="small text-muted">{{ notif.detail }}</div>
                  <div class="small text-muted" style="font-size: 0.7rem;">{{ notif.time }}</div>
                  @if (actionError() && processingId() === notif.id) {
                    <div class="small text-danger mt-1">{{ actionError() }}</div>
                  }
                </div>
              </button>
            } @empty {
              <div class="text-center text-muted p-3 small">Aucune notification</div>
            }
          </div>
          @if (hasMore()) {
            <div class="p-2 border-top text-center">
              <button class="btn btn-sm btn-link text-decoration-none p-0" (click)="loadMore()">
                Charger plus
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .bk-notif-panel {
        position: absolute;
        right: 0;
        top: calc(100% + 8px);
        width: 320px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-base);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        z-index: 100;
      }
      .bk-notif-panel .list-group-item {
        background: transparent;
        border-color: var(--color-border);
      }
      .bk-notif--unread {
        background: color-mix(in srgb, var(--color-primary, #0d6efd) 6%, transparent);
      }
    `,
  ],
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
