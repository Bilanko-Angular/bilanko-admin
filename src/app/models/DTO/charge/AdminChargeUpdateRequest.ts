export interface AdminChargeUpdateRequest {
  label: string;
  supplier: string;
  amount: number;
  date: string;
  categoryId?: number | null;
}
