import { Injectable } from '@angular/core';
import { apiClient } from '../../../core/axios/axios.config';
import { environment } from '../../../../environments/environment';
import { Page } from '../../../models/DTO/template/page';
import { AdminProductSummaryDTO } from '../../../models/DTO/product/AdminProductSummaryDTO';
import { AdminProductResponseDTO } from '../../../models/DTO/product/AdminProductResponseDTO';
import { AdminProductCreateRequest } from '../../../models/DTO/product/AdminProductCreateRequest';
import { AdminProductUpdateRequest } from '../../../models/DTO/product/AdminProductUpdateRequest';

export interface SearchProductParams {
  keyword?: string;
  categoryId?: number;
  minPurchasePrice?: number;
  maxPurchasePrice?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductApiService {
  private readonly basePath = environment.baseApiUrl + '/admin/products';

  async getSummary(): Promise<AdminProductSummaryDTO> {
    const res = await apiClient.get<AdminProductSummaryDTO>(`${this.basePath}/summary`);
    return res.data;
  }

  async getPagedProducts(page: number = 0, size: number = 10): Promise<Page<AdminProductResponseDTO>> {
    const res = await apiClient.get<Page<AdminProductResponseDTO>>(this.basePath, {
      params: { page, size },
    });
    return res.data;
  }

  async search(params: SearchProductParams): Promise<Page<AdminProductResponseDTO>> {
    const res = await apiClient.get<Page<AdminProductResponseDTO>>(`${this.basePath}/search`, {
      params: {
        keyword:          params.keyword          || undefined,
        categoryId:       params.categoryId       ?? undefined,
        minPurchasePrice: params.minPurchasePrice ?? undefined,
        maxPurchasePrice: params.maxPurchasePrice ?? undefined,
        minPrice:         params.minPrice         ?? undefined,
        maxPrice:         params.maxPrice         ?? undefined,
        page:             params.page  ?? 0,
        size:             params.size  ?? 10,
      },
    });
    return res.data;
  }

  async getById(id: number): Promise<AdminProductResponseDTO> {
    const res = await apiClient.get<AdminProductResponseDTO>(`${this.basePath}/${id}`);
    return res.data;
  }

  async createProduct(payload: AdminProductCreateRequest): Promise<AdminProductResponseDTO> {
    const res = await apiClient.post<AdminProductResponseDTO>(this.basePath, payload);
    return res.data;
  }

  async updateProduct(id: number, payload: AdminProductUpdateRequest): Promise<AdminProductResponseDTO> {
    const res = await apiClient.put<AdminProductResponseDTO>(`${this.basePath}/${id}`, payload);
    return res.data;
  }

  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete<void>(`${this.basePath}/${id}`);
  }
}
