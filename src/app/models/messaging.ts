export type StatutConversation = 'ouverte' | 'en_attente' | 'resolue';

export interface Utilisateur {
  id: string;
  nom: string;
  email: string;
  telephone?: string;
  commerce: string;
  niu?: string;
  dateInscription: string; // 'YYYY-MM-DD'
  avatarCouleur: string; // couleur de fond de l'avatar (initiales)
}

export interface Message {
  id: string;
  conversationId: string;
  auteur: 'admin' | 'utilisateur';
  contenu: string;
  envoyeLe: string; // ISO
  lu: boolean;
}

export interface Conversation {
  id: string;
  utilisateur: Utilisateur;
  statut: StatutConversation;
  sujet: string;
  dernierMessage: string;
  dernierMessageLe: string; // ISO
  nonLus: number;
}