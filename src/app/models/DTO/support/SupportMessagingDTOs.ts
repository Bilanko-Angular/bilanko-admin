import { Page } from '../template/page';

export type ConversationStatus = 'WAITING_FOR_ADMIN' | 'ACTIVE' | string;

export interface SupportConversationDTO {
  id: number;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  merchantId: number;
  merchantName: string;
  merchantSubname: string;
  merchantEmail: string;
  currentAdminId: number | null;
  currentAdminName: string | null;
  currentAdminSubname: string | null;
  canWrite: boolean;
  transferPending: boolean;
}

export interface SupportMessageDTO {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  senderName: string;
  senderSubname: string;
  senderRole: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface TransferConversationRequest {
  adminEmail: string;
}

export type SupportConversationPage = Page<SupportConversationDTO>;
export type SupportMessagePage = Page<SupportMessageDTO>;
