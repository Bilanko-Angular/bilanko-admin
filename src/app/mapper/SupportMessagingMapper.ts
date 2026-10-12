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
      statut: SupportMessagingMapper.statusFromDto(dto.status),
      sujet: 'Assistance',
      dernierMessage: '',
      dernierMessageLe: dto.updatedAt,
      nonLus: 0,
      canWrite: dto.canWrite,
      transferPending: dto.transferPending,
      currentAdminId: dto.currentAdminId != null ? String(dto.currentAdminId) : null,
      currentAdminName: [dto.currentAdminName, dto.currentAdminSubname]
        .filter(Boolean)
        .join(' ') || null,
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
      senderName: [dto.senderName, dto.senderSubname].filter(Boolean).join(' '),
    };
  }

  private static statusFromDto(status: string | null | undefined): StatutConversation {
    if (status===null || status ===undefined) {
      return 'ouverte'
    }
    switch (status.toUpperCase()) {
      case 'WAITING_FOR_ADMIN':
      case 'PENDING':
      case 'EN_ATTENTE':
        return 'en_attente';
      case 'RESOLVED':
      case 'RESOLUE':
        return 'resolue';
      case 'ACTIVE':
      case 'OPEN':
      case 'OUVERTE':
      default:
        return 'ouverte';
    }
  }
}
