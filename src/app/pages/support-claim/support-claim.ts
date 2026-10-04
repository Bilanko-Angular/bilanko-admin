import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupportMessagingStoreService } from '../../service/store/support/support-messaging-store.service';

@Component({
  selector: 'app-support-claim',
  standalone: true,
  template: `
    <div class="claim-page">
      @if (isLoading()) {
        <p>Prise en charge de la conversation…</p>
      } @else if (error()) {
        <p class="claim-error">{{ error() }}</p>
        <button type="button" (click)="goMessaging()">Retour à la messagerie</button>
      }
    </div>
  `,
  styles: [
    `
      .claim-page {
        min-height: 40vh;
        display: grid;
        place-content: center;
        gap: 1rem;
        text-align: center;
        padding: 2rem;
      }
      .claim-error {
        color: #b42318;
      }
      button {
        justify-self: center;
        border: 1px solid var(--color-border, #d0d5dd);
        background: var(--color-surface, #fff);
        border-radius: 8px;
        padding: 0.5rem 1rem;
        cursor: pointer;
      }
    `,
  ],
})
export class SupportClaim implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly supportStore = inject(SupportMessagingStoreService);

  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  async ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.isLoading.set(false);
      this.error.set('Lien de prise en main invalide');
      return;
    }

    const conversation = await this.supportStore.claim(token);
    this.isLoading.set(false);

    if (!conversation) {
      this.error.set(this.supportStore.error() ?? 'Impossible de prendre la conversation');
      return;
    }

    await this.router.navigate(['/messaging'], {
      queryParams: { conversationId: conversation.id },
      replaceUrl: true,
    });
  }

  goMessaging() {
    void this.router.navigate(['/messaging']);
  }
}
