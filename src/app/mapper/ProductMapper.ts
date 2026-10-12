import { AdminProductResponseDTO } from '../models/DTO/product/AdminProductResponseDTO';
import { AdminProduct } from '../models/product/adminProduct';

export class ProductMapper {
  static dtoToAdminProduct(dto: AdminProductResponseDTO): AdminProduct {
    return {
      id:            dto.id,
      createdAt:     dto.createdAt,
      name:          dto.name,
      reference:     dto.reference,
      purchasePrice: dto.purchasePrice,
      price:         dto.price,
      quantity:      dto.quantity,
      alertThreshold: dto.alertThreshold ?? null,
      categories:    dto.categories ?? [],
      userId:        dto.userId,
      userName:      dto.userName,
      userSubname:   dto.userSubname,
    };
  }
}
