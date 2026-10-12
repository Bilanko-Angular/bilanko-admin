import {
  Component,
  inject,
  signal,
  computed,
  ElementRef,
  viewChild,
  effect,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupportMessagingStoreService } from '../../service/store/support/support-messaging-store.service';
import { StatutConversation } from '../../models/messaging';

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './messaging.html',
  styleUrl: './messaging.css',
})
export class Messaging {
  private readonly messagingStore = inject(SupportMessagingStoreService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zoneMessages = viewChild<ElementRef<HTMLDivElement>>('zoneMessages');

  readonly conversations = this.messagingStore.conversations;
  readonly isLoading = this.messagingStore.isLoading;
  readonly storeError = this.messagingStore.error;
  readonly recherche = signal('');
  readonly filtreStatut = signal<'toutes' | StatutConversation>('toutes');
  readonly conversationActiveId = signal<string | null>(null);
  readonly vueMobile = signal<'liste' | 'discussion'>('liste');
  readonly panneauContactOuvert = signal(false);
  readonly brouillon = signal('');
  readonly emailTransfert = signal('');
  readonly transfertEnCours = signal(false);
  readonly transfertMessage = signal<string | null>(null);

  readonly conversationsFiltrees = computed(() => {
    const terme = this.recherche().trim().toLowerCase();
    const statut = this.filtreStatut();
    return this.conversations()
      .filter((c) => statut === 'toutes' || c.statut === statut)
      .filter(
        (c) =>
          !terme ||
          c.utilisateur.nom.toLowerCase().includes(terme) ||
          c.utilisateur.commerce.toLowerCase().includes(terme) ||
          c.sujet.toLowerCase().includes(terme),
      )
      .sort((a, b) => b.dernierMessageLe.localeCompare(a.dernierMessageLe));
  });

  readonly conversationActive = computed(
    () => this.conversations().find((c) => c.id === this.conversationActiveId()) ?? null,
  );

  readonly messagesActifs = computed(() => {
    const id = this.conversationActiveId();
    return id ? this.messagingStore.messagesDe(id)() : [];
  });

  readonly totalNonLus = computed(() => this.conversations().reduce((s, c) => s + c.nonLus, 0));

  constructor() {
    void this.messagingStore.loadPage();

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const conversationId = params.get('conversationId');
      if (conversationId && conversationId !== this.conversationActiveId()) {
        void this.ouvrirConversation(conversationId);
      }
    });

    effect(() => {
      this.messagesActifs();
      queueMicrotask(() => {
        const el = this.zoneMessages()?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
      });
    });
  }

  async ouvrirConversation(id: string) {
    this.conversationActiveId.set(id);
    this.vueMobile.set('discussion');
    this.transfertMessage.set(null);
    this.emailTransfert.set('');
    this.messagingStore.markAsRead(id);
    await Promise.all([
      this.messagingStore.loadConversation(id),
      this.messagingStore.loadMessages(id),
    ]);

    const current = this.route.snapshot.queryParamMap.get('conversationId');
    if (current !== id) {
      await this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { conversationId: id },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  retourALaListe() {
    this.vueMobile.set('liste');
  }

  toggleContact() {
    this.panneauContactOuvert.update((v) => !v);
  }

  async envoyer() {
    const texte = this.brouillon().trim();
    const id = this.conversationActiveId();
    if (!texte || !id || !this.conversationActive()?.canWrite) return;
    if (await this.messagingStore.sendMessage(id, texte)) this.brouillon.set('');
  }

  async transferer() {
    const id = this.conversationActiveId();
    const email = this.emailTransfert().trim();
    if (!id || !email || !this.conversationActive()?.canWrite) return;

    this.transfertEnCours.set(true);
    this.transfertMessage.set(null);
    try {
      const ok = await this.messagingStore.transfer(id, email);
      if (ok) {
        this.transfertMessage.set('Demande de transfert envoyée.');
        this.emailTransfert.set('');
      } else {
        this.transfertMessage.set(
          this.messagingStore.error() ?? 'Échec du transfert de la conversation',
        );
      }
    } finally {
      this.transfertEnCours.set(false);
    }
  }

  gererTouche(evenement: KeyboardEvent) {
    if (evenement.key === 'Enter' && !evenement.shiftKey) {
      evenement.preventDefault();
      void this.envoyer();
    }
  }

  initiales(nom: string): string {
    return nom
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  heureRelative(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return "à l'instant";
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h} h`;
    const j = Math.floor(h / 24);
    return `${j} j`;
  }

  heure(iso: string): string {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}
