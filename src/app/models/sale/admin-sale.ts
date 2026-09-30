import { SaleItemResponseDTO } from '../DTO/sale/SaleDTOs';

export interface AdminSale {
  id: number;
  saleDate: string;
  customerName: string;
  totalAmount: number;
  totalMargin: number;
  itemCount: number;
  items: SaleItemResponseDTO[];
  userId: number;
  userName: string;
  userSubname: string;
}
