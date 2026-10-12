import { Injectable } from '@angular/core';
import { apiClient } from '../../../core/axios/axios.config';
import { environment } from '../../../../environments/environment';
import { Page } from '../../../models/DTO/template/page';
import { AdminChargeSummaryDTO } from '../../../models/DTO/charge/AdminChargeSummaryDTO';
import { AdminChargeResponseDTO } from '../../../models/DTO/charge/AdminChargeResponseDTO';
import { AdminChargeCreateRequest } from '../../../models/DTO/charge/AdminChargeCreateRequest';
import { AdminChargeUpdateRequest } from '../../../models/DTO/charge/AdminChargeUpdateRequest';

export interface SearchChargeParams {
  keyword?: string;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ChargeApiService {
  private readonly basePath = environment.baseApiUrl + '/admin/charges';

  async getSummary(): Promise<AdminChargeSummaryDTO> {
    const response = await apiClient.get<AdminChargeSummaryDTO>(`${this.basePath}/summary`);
    return response.data;
  }

  async getPagedCharges(page: number = 0, size: number = 10): Promise<Page<AdminChargeResponseDTO>> {
    const response = await apiClient.get<Page<AdminChargeResponseDTO>>(this.basePath, {
      params: { page, size },
    });
    return response.data;
  }

  async search(params: SearchChargeParams): Promise<Page<AdminChargeResponseDTO>> {
    const response = await apiClient.get<Page<AdminChargeResponseDTO>>(`${this.basePath}/search`, {
      params: {
        keyword: params.keyword || undefined,
        categoryId: params.categoryId,
        startDate: params.startDate || undefined,
        endDate: params.endDate || undefined,
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    });
    return response.data;
  }

  async createCharge(payload: AdminChargeCreateRequest): Promise<AdminChargeResponseDTO> {
    const response = await apiClient.post<AdminChargeResponseDTO>(this.basePath, payload);
    return response.data;
  }

  async updateCharge(id: number, payload: AdminChargeUpdateRequest): Promise<AdminChargeResponseDTO> {
    const response = await apiClient.put<AdminChargeResponseDTO>(`${this.basePath}/${id}`, payload);
    return response.data;
  }

  async deleteCharge(id: number): Promise<void> {
    await apiClient.delete<void>(`${this.basePath}/${id}`);
  }
}
