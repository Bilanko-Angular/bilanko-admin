export interface NotificationResponseDTO {
    id: number;
    type: "NEW_SALE" | "MONTHLY_REPORT" | "APP_UPDATE" | "WELCOME" | "NEW_CHARGE";
    title: string;
    message: string;
    read: boolean;
    referenceId: number | null;
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
