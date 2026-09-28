import { Injectable } from '@angular/core';
import {AdminSummaryDTO} from '../../../models/DTO/user-management/AdminSummaryDTO';
import {apiClient} from '../../../core/axios/axios.config';
import {environment} from '../../../../environments/environment';
import {AdminUserResponseDTO} from '../../../models/DTO/user-management/AdminUserResponseDTO';
import {Page} from '../../../models/DTO/template/page';
import {UserRole} from '../../../models/type/user-role';
import {AdminUserCreateRequest} from '../../../models/DTO/user-management/AdminUserCreateRequest';
import {AdminUserUpdateRequest} from '../../../models/DTO/user-management/AdminUserUpdateRequest';

export  interface SearchUserParams {
  keyword?: string;
  active?: boolean;
  role?: UserRole;
  page?: number;
  size?: number;
}
@Injectable({
  providedIn: 'root',
})
export class UserManagentApiService {
  private readonly basePath = environment.baseApiUrl + '/admin/users';

  public async getSummary():Promise<AdminSummaryDTO> {
    const response = await apiClient.get<AdminSummaryDTO>(`${this.basePath}/summary`);
    return response.data;
  }

  async search(params: SearchUserParams): Promise<Page<AdminUserResponseDTO>> {
    const response = await apiClient.get<Page<AdminUserResponseDTO>>(`${this.basePath}/search`, {
      params: {
        keyword: params.keyword || undefined,
        active: params.active,
        role: params.role || undefined,
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    });
    return response.data;
  }

  async createUser(payload: AdminUserCreateRequest): Promise<AdminUserResponseDTO> {
    const response = await apiClient.post<AdminUserResponseDTO>(`${this.basePath}/create`, payload);
    return response.data;
  }
  // ---- PUT : mettre à jour un utilisateur ----
  async updateUser(id: number, payload: AdminUserUpdateRequest): Promise<AdminUserResponseDTO> {
    const response = await apiClient.put<AdminUserResponseDTO>(
      `${this.basePath}/${id}`,
      payload
    );
    return response.data;
  }

  // ---- PATCH : changer le statut actif/inactif ----
  async updateUserStatus(id: number, active: boolean): Promise<AdminUserResponseDTO> {
    const response = await apiClient.patch<AdminUserResponseDTO>(
      `${this.basePath}/${id}/status`,
      null,                       // pas de body, tout passe en query param
      { params: { active } }      // ⚠️ voir note sur @RequestParam
    );
    return response.data;
  }

  // ---- DELETE : supprimer un utilisateur ----
  async deleteUser(id: number): Promise<void> {
    await apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  // ---- GET : liste paginée ----
  async getPagedUsers(page: number = 0, size: number = 10): Promise<Page<AdminUserResponseDTO>> {
    const response = await apiClient.get<Page<AdminUserResponseDTO>>(
      `${this.basePath}`,
      { params: { page, size } }
    );
    return response.data;
  }

  // ---- GET : tous les utilisateurs ----
  async getAllUsers(): Promise<AdminUserResponseDTO[]> {
    const response = await apiClient.get<AdminUserResponseDTO[]>(
      `${this.basePath}/all`
    );
    return response.data;
  }
}
