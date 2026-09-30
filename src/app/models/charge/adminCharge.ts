export interface AdminCharge {
  id: number;
  label: string;
  supplier: string;
  amount: number;
  date: string;
  createdAt: string;
  categoryId: number | null;
  categoryName: string;
  userId: number;
  userName: string;
  userSubname: string;
}
