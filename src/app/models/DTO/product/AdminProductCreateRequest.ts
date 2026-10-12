export interface AdminProductCreateRequest {
  userId: number;
  name: string;
  quantity: number;
  price: number;
  purchasePrice: number;
  alertThreshold?: number | null;
  categoryIds?: number[];
}
