export interface AdminChargeResponseDTO {
  id: number;
  date: string;
  createdAt: string;
  label: string;
  supplier: string;
  amount: number;
  categoryId: number | null;
  categoryName: string | null;
  userId: number;
  userName: string;
  userSubname: string;
}
