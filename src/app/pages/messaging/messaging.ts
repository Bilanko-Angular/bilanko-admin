import { Component, inject, signal, computed, ElementRef, viewChild, effect, HostListener } from '@angular/core';
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

  // --- Menus contextuels style WhatsApp ---
  readonly menuMessageOuvertId = signal<string | null>(null);
  readonly menuConversationOuvert = signal(false);
  readonly messageEnEditionId = signal<string | null>(null);
  readonly brouillonEdition = signal('');

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

  @HostListener('document:click')
  fermerTousLesMenus() {
    this.menuMessageOuvertId.set(null);
    this.menuConversationOuvert.set(false);
  }

  ouvrirConversation(id: string) {
    this.conversationActiveId.set(id);
    this.vueMobile.set('discussion');
    this.messagingService.marquerCommeLu(id);
    this.messageEnEditionId.set(null);
  }

  retourALaListe() { this.vueMobile.set('liste'); }
  toggleContact() { this.panneauContactOuvert.update((v) => !v); }

  // --- Menu par message ---
  toggleMenuMessage(evenement: Event, messageId: string) {
    evenement.stopPropagation();
    this.menuMessageOuvertId.update((id) => (id === messageId ? null : messageId));
  }

  commencerEdition(evenement: Event, messageId: string, contenuActuel: string) {
    evenement.stopPropagation();
    this.messageEnEditionId.set(messageId);
    this.brouillonEdition.set(contenuActuel);
    this.menuMessageOuvertId.set(null);
  }

  annulerEdition() {
    this.messageEnEditionId.set(null);
    this.brouillonEdition.set('');
  }

  validerEdition(messageId: string) {
    const texte = this.brouillonEdition().trim();
    if (texte) this.messagingService.modifierMessage(messageId, texte);
    this.annulerEdition();
  }

  supprimerMessage(evenement: Event, messageId: string) {
    evenement.stopPropagation();
    this.messagingService.supprimerMessage(messageId);
    this.menuMessageOuvertId.set(null);
  }

  copierMessage(evenement: Event, contenu: string) {
    evenement.stopPropagation();
    navigator.clipboard?.writeText(contenu);
    this.menuMessageOuvertId.set(null);
  }

  // --- Menu par conversation ---
  toggleMenuConversation(evenement: Event) {
    evenement.stopPropagation();
    this.menuConversationOuvert.update((v) => !v);
  }

  marquerCommeResolue(evenement: Event, conversationId: string) {
    evenement.stopPropagation();
    this.messagingService.changerStatut(conversationId, 'resolue');
    this.menuConversationOuvert.set(false);
  }

  marquerCommeOuverte(evenement: Event, conversationId: string) {
    evenement.stopPropagation();
    this.messagingService.changerStatut(conversationId, 'ouverte');
    this.menuConversationOuvert.set(false);
  }

  basculerBlocage(evenement: Event, conversationId: string) {
    evenement.stopPropagation();
    this.messagingService.basculerBlocage(conversationId);
    this.menuConversationOuvert.set(false);
  }

  supprimerConversation(evenement: Event, conversationId: string) {
    evenement.stopPropagation();
    if (!confirm('Supprimer définitivement cette conversation ?')) return;
    this.messagingService.supprimerConversation(conversationId);
    this.conversationActiveId.set(null);
    this.vueMobile.set('liste');
    this.menuConversationOuvert.set(false);
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

  gererToucheEdition(evenement: KeyboardEvent, messageId: string) {
    if (evenement.key === 'Enter' && !evenement.shiftKey) {
      evenement.preventDefault();
      this.validerEdition(messageId);
    }
    if (evenement.key === 'Escape') this.annulerEdition();
  }

  initiales(nom: string): string {
    return nom.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  }

  heureRelative(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return "à l'instant";
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h} h`;
    return `${Math.floor(h / 24)} j`;
  }

  heure(iso: string): string {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}