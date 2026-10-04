export type NotificationType =
  | 'NEW_SALE'
  | 'MONTHLY_REPORT'
  | 'APP_UPDATE'
  | 'WELCOME'
  | 'NEW_CHARGE'
  | 'SUPPORT_CLAIM_REQUEST'
  | 'SUPPORT_TRANSFER_REQUEST'
  | 'SUPPORT_CONVERSATION_READY'
  | 'SUPPORT_ADMIN_CHANGED'
  | 'SUPPORT_NEW_MESSAGE';

export interface NotificationResponseDTO {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  referenceId: number | null;
  /** Lien d'action (ex. /admin/support/claim/{token}). */
  actionLink: string | null;
  createdAt: string;
}

export interface NotificationPageDTO {
  content: NotificationResponseDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasMore: boolean;
  unreadCount: number;
}
