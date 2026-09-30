import { AdminChargeResponseDTO } from '../models/DTO/charge/AdminChargeResponseDTO';
import { AdminCharge } from '../models/charge/adminCharge';
import { AdminChargeCreateRequest } from '../models/DTO/charge/AdminChargeCreateRequest';
import { AdminChargeUpdateRequest } from '../models/DTO/charge/AdminChargeUpdateRequest';

export class ChargeMapper {
  static dtoToAdminCharge(dto: AdminChargeResponseDTO): AdminCharge {
    return {
      id: dto.id,
      label: dto.label,
      supplier: dto.supplier,
      amount: dto.amount,
      date: dto.date,
      createdAt: dto.createdAt,
      categoryId: dto.categoryId ?? null,
      categoryName: dto.categoryName ?? 'Sans catégorie',
      userId: dto.userId,
      userName: dto.userName,
      userSubname: dto.userSubname,
    };
  }

  static toCreateRequest(
    charge: Pick<AdminCharge, 'label' | 'supplier' | 'amount' | 'date' | 'categoryId' | 'userId'>
  ): AdminChargeCreateRequest {
    return {
      label: charge.label,
      supplier: charge.supplier,
      amount: charge.amount,
      date: charge.date,
      categoryId: charge.categoryId ?? null,
      userId: charge.userId,
    };
  }

  static toUpdateRequest(
    charge: Pick<AdminCharge, 'label' | 'supplier' | 'amount' | 'date' | 'categoryId'>
  ): AdminChargeUpdateRequest {
    return {
      label: charge.label,
      supplier: charge.supplier,
      amount: charge.amount,
      date: charge.date,
      categoryId: charge.categoryId ?? null,
    };
  }
}
