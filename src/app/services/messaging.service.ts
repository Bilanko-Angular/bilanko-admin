import { Injectable, signal, computed } from '@angular/core';
import { Conversation, Message, Utilisateur } from '../models/messaging';

const UTILISATEURS: Utilisateur[] = [
  { id: 'u1', nom: 'Mesmine Kamtchoua', email: 'mesmine.k@gmail.com', telephone: '+237 677 12 34 56', commerce: 'Ets Mballa & Fils', niu: 'P012345678901Z', dateInscription: '2026-03-14', avatarCouleur: '#63B78D' },
  { id: 'u2', nom: 'Jean Fotso', email: 'jfotso@yahoo.fr', telephone: '+237 699 88 22 11', commerce: 'Boutique La Grâce', niu: 'P098765432100X', dateInscription: '2026-01-22', avatarCouleur: '#C98A3D' },
  { id: 'u3', nom: 'Aïcha Njoya', email: 'aicha.njoya@outlook.com', commerce: 'Épicerie Centrale', dateInscription: '2026-05-02', avatarCouleur: '#2E5F45' },
  { id: 'u4', nom: 'Paul Essomba', email: 'p.essomba@gmail.com', telephone: '+237 655 40 12 09', commerce: 'Transport Express', dateInscription: '2025-11-30', avatarCouleur: '#6B6B65' },
  { id: 'u5', nom: 'Grace Talla', email: 'gracetalla@gmail.com', commerce: 'Restaurant Le Palo', dateInscription: '2026-02-18', avatarCouleur: '#549B78' },
];

@Injectable({ providedIn: 'root' })
export class MessagingService {
  private readonly _conversations = signal<Conversation[]>([
    {
      id: 'c1',
      utilisateur: UTILISATEURS[0],
      statut: 'ouverte',
      sujet: 'Problème génération PDF',
      dernierMessage: "Le document ne se télécharge pas depuis hier soir, pouvez-vous vérifier ?",
      dernierMessageLe: '2026-09-12T09:14:00',
      nonLus: 2,
    },
    {
      id: 'c2',
      utilisateur: UTILISATEURS[1],
      statut: 'en_attente',
      sujet: 'Question sur le régime fiscal',
      dernierMessage: 'Merci pour votre retour, je vérifie avec mon comptable.',
      dernierMessageLe: '2026-09-11T16:40:00',
      nonLus: 0,
    },
    {
      id: 'c3',
      utilisateur: UTILISATEURS[2],
      statut: 'ouverte',
      sujet: 'Demande de fonctionnalité',
      dernierMessage: 'Serait-il possible d\'ajouter les charges récurrentes ?',
      dernierMessageLe: '2026-09-11T11:02:00',
      nonLus: 1,
    },
    {
      id: 'c4',
      utilisateur: UTILISATEURS[3],
      statut: 'resolue',
      sujet: 'Erreur de calcul du stock',
      dernierMessage: 'Parfait, tout fonctionne maintenant, merci beaucoup !',
      dernierMessageLe: '2026-09-09T08:20:00',
      nonLus: 0,
    },
    {
      id: 'c5',
      utilisateur: UTILISATEURS[4],
      statut: 'ouverte',
      sujet: 'Difficulté à se connecter',
      dernierMessage: "Je n'arrive plus à me connecter depuis ce matin.",
      dernierMessageLe: '2026-09-12T07:55:00',
      nonLus: 3,
    },
  ]);

  private readonly _messages = signal<Message[]>([
    { id: 'm1', conversationId: 'c1', auteur: 'utilisateur', contenu: 'Bonjour, je rencontre un souci pour générer mon dossier de prêt.', envoyeLe: '2026-09-12T08:50:00', lu: true },
    { id: 'm2', conversationId: 'c1', auteur: 'admin', contenu: 'Bonjour Mesmine, pouvez-vous me préciser à quelle étape ça bloque ?', envoyeLe: '2026-09-12T08:55:00', lu: true },
    { id: 'm3', conversationId: 'c1', auteur: 'utilisateur', contenu: "Quand je clique sur \"Générer le dossier PDF\", rien ne se passe.", envoyeLe: '2026-09-12T09:02:00', lu: false },
    { id: 'm4', conversationId: 'c1', auteur: 'utilisateur', contenu: "Le document ne se télécharge pas depuis hier soir, pouvez-vous vérifier ?", envoyeLe: '2026-09-12T09:14:00', lu: false },

    { id: 'm5', conversationId: 'c2', auteur: 'utilisateur', contenu: 'Bonjour, je ne comprends pas quel régime fiscal choisir pour ma boutique.', envoyeLe: '2026-09-11T15:30:00', lu: true },
    { id: 'm6', conversationId: 'c2', auteur: 'admin', contenu: 'Cela dépend de votre chiffre d\'affaires annuel — en dessous de 10M FCFA, la Contribution Libératoire est généralement la plus simple.', envoyeLe: '2026-09-11T16:10:00', lu: true },
    { id: 'm7', conversationId: 'c2', auteur: 'utilisateur', contenu: 'Merci pour votre retour, je vérifie avec mon comptable.', envoyeLe: '2026-09-11T16:40:00', lu: true },
  ]);

  readonly conversations = this._conversations.asReadonly();
  readonly messages = this._messages.asReadonly();

  messagesDe(conversationId: string) {
    return computed(() =>
      this._messages().filter((m) => m.conversationId === conversationId)
        .sort((a, b) => a.envoyeLe.localeCompare(b.envoyeLe))
    );
  }

  envoyerMessage(conversationId: string, contenu: string) {
    const nouveauMessage: Message = {
      id: `m${Date.now()}`,
      conversationId,
      auteur: 'admin',
      contenu,
      envoyeLe: new Date().toISOString(),
      lu: true,
    };
    this._messages.update((liste) => [...liste, nouveauMessage]);
    this._conversations.update((liste) =>
      liste.map((c) =>
        c.id === conversationId
          ? { ...c, dernierMessage: contenu, dernierMessageLe: nouveauMessage.envoyeLe, nonLus: 0 }
          : c
      )
    );
  }

  marquerCommeLu(conversationId: string) {
    this._messages.update((liste) =>
      liste.map((m) => (m.conversationId === conversationId ? { ...m, lu: true } : m))
    );
    this._conversations.update((liste) =>
      liste.map((c) => (c.id === conversationId ? { ...c, nonLus: 0 } : c))
    );
  }
}