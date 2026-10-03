export interface AdminProductCategoryInfo {
  id: number;
  name: string;
}

export interface AdminProductResponseDTO {
  id: number;
  createdAt: string; // ISO 8601 Instant
  name: string;
  reference: string;
  purchasePrice: number;
  price: number;
  quantity: number;
  alertThreshold: number | null;
  categories: AdminProductCategoryInfo[];
  userId: number;
  userName: string;
  userSubname: string;
}
