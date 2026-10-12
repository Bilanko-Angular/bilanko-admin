import {AdminUserResponseDTO} from '../models/DTO/user-management/AdminUserResponseDTO';
import {AdminUser} from '../models/user-management/admin-user';
import {AdminUserUpdateRequest} from '../models/DTO/user-management/AdminUserUpdateRequest';
import {AdminUserCreateRequest} from '../models/DTO/user-management/AdminUserCreateRequest';

export class UserManagerMapper {
  static dtoAdmintoAdminuser(user: AdminUserResponseDTO):AdminUser {
    return {
      id:user.id,
      name:user.name,
      subname:user.subname,
      email:user.email,
      phone:user?.phoneNumber || null,
      role: user.role,
      status: user.active ? 'active' : "blocked",
      createdAt: user.createdAt,
      lastLogin: user.lastConnectionDate,
      productsCount: user.numberOfProducts,
      city:user.adresse
    }
  }

  static adminUsertoAdminUpdate(user:AdminUser):AdminUserUpdateRequest{
    return {
      name:user.name,
      subname:user.subname,
      email:user.email,
      phoneNumber:user.phone || undefined,
      adresse: user.city || undefined,
    }
  }



}
