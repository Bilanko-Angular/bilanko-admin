import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Notification {
  id: number;
  title: string;
  detail: string;
  time: string;
  type: 'stock' | 'vente' | 'systeme';
}

@Component({
  selector: 'app-notifications-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="position-relative">
      <button type="button" class="bk-header__action-btn" (click)="toggle()" title="Notifications">
        <span class="material-icons">notifications</span>
        @if (notifications().length > 0) {
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.6rem;">
            {{ notifications().length }}
          </span>
        }
      </button>

      @if (open()) {
        <div class="bk-notif-panel">
          <div class="p-2 border-bottom d-flex justify-content-between align-items-center">
            <strong class="small">Notifications</strong>
            <button class="btn btn-sm btn-link text-decoration-none p-0" (click)="clearAll()">Tout effacer</button>
          </div>
          <div class="list-group list-group-flush" style="max-height: 250px; overflow-y: auto;">
            @for (notif of notifications(); track notif.id) {
              <div class="list-group-item d-flex gap-2 align-items-start">
                <span class="material-icons text-primary" style="font-size: 0.8rem;">circle</span>
                <div>
                  <div class="fw-semibold small">{{ notif.title }}</div>
                  <div class="small text-muted">{{ notif.detail }}</div>
                  <div class="small text-muted" style="font-size: 0.7rem;">{{ notif.time }}</div>
                </div>
              </div>
            } @empty {
              <div class="text-center text-muted p-3 small">Aucune notification</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .bk-notif-panel {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      width: 320px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-base);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      z-index: 100;
    }
    .bk-notif-panel .list-group-item {
      background: transparent;
      border-color: var(--color-border);
    }
  `]
})
export class NotificationsBell {
  open = signal(false);
  notifications = signal<Notification[]>([
    { id: 1, title: 'Nouvelle vente', detail: 'Vente enregistrée pour Jean Mballa', time: 'Il y a 5 min', type: 'vente' },
    { id: 2, title: 'Stock faible', detail: 'Le produit "MacBook Pro" est en dessous du seuil', time: 'Il y a 1h', type: 'stock' },
    { id: 3, title: 'Mise à jour', detail: 'Le catalogue a été synchronisé', time: 'Hier', type: 'systeme' },
  ]);

  toggle() {
    this.open.update(v => !v);
  }

  clearAll() {
    this.notifications.set([]);
    this.open.set(false);
  }
}