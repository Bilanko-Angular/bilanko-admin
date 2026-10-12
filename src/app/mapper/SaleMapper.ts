import { AdminSaleResponseDTO } from '../models/DTO/sale/SaleDTOs';
import { AdminSale } from '../models/sale/admin-sale';

export class SaleMapper {
  static dtoToAdminSale(dto: AdminSaleResponseDTO): AdminSale {
    return {
      id: dto.id,
      saleDate: dto.saleDate,
      customerName: dto.customerName,
      totalAmount: dto.totalAmount,
      totalMargin: dto.totalMargin,
      itemCount: dto.itemCount,
      items: dto.items || [],
      userId: dto.userId,
      userName: dto.userName,
      userSubname: dto.userSubname
    };
  }
}
