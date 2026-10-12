import { Injectable } from '@angular/core';
import { apiClient } from '../../../core/axios/axios.config';
import { environment } from '../../../../environments/environment';
import { Page } from '../../../models/DTO/template/page';
import {
  AdminSaleCreateRequest,
  AdminSaleResponseDTO,
  AdminSaleSummaryDTO,
  AdminSaleUpdateRequest
} from '../../../models/DTO/sale/SaleDTOs';

export interface SearchSaleParams {
  keyword?: string;
  minItems?: number;
  maxItems?: number;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root',
})
export class VenteApiService {
  private readonly basePath = environment.baseApiUrl + '/admin/sales';

  async getSummary(): Promise<AdminSaleSummaryDTO> {
    const response = await apiClient.get<AdminSaleSummaryDTO>(`${this.basePath}/summary`);
    return response.data;
  }

  async search(params: SearchSaleParams): Promise<Page<AdminSaleResponseDTO>> {
    const response = await apiClient.get<Page<AdminSaleResponseDTO>>(`${this.basePath}/search`, {
      params: {
        keyword: params.keyword || undefined,
        minItems: params.minItems,
        maxItems: params.maxItems,
        minAmount: params.minAmount,
        maxAmount: params.maxAmount,
        startDate: params.startDate,
        endDate: params.endDate,
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    });
    return response.data;
  }

  async getPagedSales(page: number = 0, size: number = 10): Promise<Page<AdminSaleResponseDTO>> {
    const response = await apiClient.get<Page<AdminSaleResponseDTO>>(`${this.basePath}`, {
      params: { page, size }
    });
    return response.data;
  }

  async createSale(payload: AdminSaleCreateRequest): Promise<AdminSaleResponseDTO> {
    const response = await apiClient.post<AdminSaleResponseDTO>(`${this.basePath}`, payload);
    return response.data;
  }

  async updateSale(id: number, payload: AdminSaleUpdateRequest): Promise<AdminSaleResponseDTO> {
    const response = await apiClient.put<AdminSaleResponseDTO>(`${this.basePath}/${id}`, payload);
    return response.data;
  }

  async deleteSale(id: number): Promise<void> {
    await apiClient.delete<void>(`${this.basePath}/${id}`);
  }
}
