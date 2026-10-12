export interface SaleItemRequestDTO {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface SaleItemResponseDTO {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface AdminSaleSummaryDTO {
  totalCount: number;
  totalAmount: number;
  totalMargin: number;
  currentMonthAmount: number;
}

export interface AdminSaleResponseDTO {
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

export interface AdminSaleCreateRequest {
  userId: number;
  saleDate?: string;
  customerName?: string;
  items: SaleItemRequestDTO[];
}

export interface AdminSaleUpdateRequest {
  saleDate?: string;
  customerName?: string;
  items: SaleItemRequestDTO[];
}
