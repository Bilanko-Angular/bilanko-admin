export interface AdminChargeCreateRequest {
  label: string;
  supplier: string;
  amount: number;
  date: string;
  categoryId?: number | null;
  userId: number;
}
