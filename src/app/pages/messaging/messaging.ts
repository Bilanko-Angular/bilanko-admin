import { Component, inject, signal, computed, ElementRef, viewChild, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessagingService } from '../../services/messaging.service';
import { StatutConversation } from '../../models/messaging';

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './messaging.html',
  styleUrl: './messaging.css',
})
export class Messaging {
  private readonly messagingService = inject(MessagingService);
  private readonly zoneMessages = viewChild<ElementRef<HTMLDivElement>>('zoneMessages');

  readonly conversations = this.messagingService.conversations;
  readonly recherche = signal('');
  readonly filtreStatut = signal<'toutes' | StatutConversation>('toutes');
  readonly conversationActiveId = signal<string | null>(null);
  readonly vueMobile = signal<'liste' | 'discussion'>('liste');
  readonly panneauContactOuvert = signal(false);
  readonly brouillon = signal('');

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
          c.sujet.toLowerCase().includes(terme)
      )
      .sort((a, b) => b.dernierMessageLe.localeCompare(a.dernierMessageLe));
  });

  readonly conversationActive = computed(() =>
    this.conversations().find((c) => c.id === this.conversationActiveId()) ?? null
  );

  readonly messagesActifs = computed(() => {
    const id = this.conversationActiveId();
    return id ? this.messagingService.messagesDe(id)() : [];
  });

  readonly totalNonLus = computed(() => this.conversations().reduce((s, c) => s + c.nonLus, 0));

  constructor() {
    effect(() => {
      this.messagesActifs();
      queueMicrotask(() => {
        const el = this.zoneMessages()?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
      });
    });
  }

  ouvrirConversation(id: string) {
    this.conversationActiveId.set(id);
    this.vueMobile.set('discussion');
    this.messagingService.marquerCommeLu(id);
  }

  retourALaListe() {
    this.vueMobile.set('liste');
  }

  toggleContact() {
    this.panneauContactOuvert.update((v) => !v);
  }

  envoyer() {
    const texte = this.brouillon().trim();
    const id = this.conversationActiveId();
    if (!texte || !id) return;
    this.messagingService.envoyerMessage(id, texte);
    this.brouillon.set('');
  }

  gererTouche(evenement: KeyboardEvent) {
    if (evenement.key === 'Enter' && !evenement.shiftKey) {
      evenement.preventDefault();
      this.envoyer();
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