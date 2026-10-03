import { Conversation, Message, StatutConversation } from '../models/messaging';
import {
  SupportConversationDTO,
  SupportMessageDTO,
} from '../models/DTO/support/SupportMessagingDTOs';

export class SupportMessagingMapper {
  static conversationFromDto(dto: SupportConversationDTO): Conversation {
    const fullName = [dto.merchantName, dto.merchantSubname].filter(Boolean).join(' ');

    return {
      id: String(dto.id),
      utilisateur: {
        id: String(dto.merchantId),
        nom: fullName || dto.merchantName,
        email: dto.merchantEmail,
        commerce: '',
        dateInscription: dto.createdAt.slice(0, 10),
        avatarCouleur: '#2E5F45',
      },
      statut: this.statusFromDto(dto.status),
      sujet: 'Assistance',
      dernierMessage: '',
      dernierMessageLe: dto.updatedAt,
      nonLus: 0,
      canWrite: dto.canWrite,
      transferPending: dto.transferPending,
    };
  }

  static messageFromDto(dto: SupportMessageDTO, conversationId: number | string): Message {
    const isAdmin = dto.senderRole.toLowerCase().includes('admin');

    return {
      id: String(dto.id),
      conversationId: String(conversationId),
      auteur: isAdmin ? 'admin' : 'utilisateur',
      contenu: dto.content,
      envoyeLe: dto.createdAt,
      lu: true,
    };
  }

  private static statusFromDto(status: string): StatutConversation {
    switch (status.toUpperCase()) {
      case 'RESOLVED':
      case 'RESOLUE':
        return 'resolue';
      case 'PENDING':
      case 'EN_ATTENTE':
        return 'en_attente';
      default:
        return 'ouverte';
    }
  }
}
