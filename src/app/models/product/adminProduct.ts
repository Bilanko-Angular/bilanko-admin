import {AdminProductCategoryInfo} from '../DTO/product/AdminProductResponseDTO';

export interface AdminProduct {
  id: number;
  createdAt: string;
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
