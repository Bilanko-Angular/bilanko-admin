import { Injectable } from '@angular/core';
import { apiClient } from '../../../core/axios/axios.config';
import { environment } from '../../../../environments/environment';
import { Page } from '../../../models/DTO/template/page';
import {
  CategoryDTO,
  CategorySearch,
  CategorySummaryDTO,
  CategoryType,
  CleanCategoryDTO
} from '../../../models/DTO/category/CategoryDTOs';

export interface SearchCategoryParams {
  name?: string;
  categoryType?: CategoryType;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryApiService {
  private readonly basePath = environment.baseApiUrl + '/api/categories';

  async getSummary(): Promise<CategorySummaryDTO> {
    const response = await apiClient.get<CategorySummaryDTO>(`${this.basePath}/summary`);
    return response.data;
  }

  async search(params: SearchCategoryParams): Promise<Page<CategorySearch>> {
    const response = await apiClient.get<Page<CategorySearch>>(`${this.basePath}/search`, {
      params: {
        name: params.name || '',
        categoryType: params.categoryType || undefined,
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    });
    return response.data;
  }

  async getAll(categoryType?: CategoryType, page: number = 0, size: number = 10): Promise<Page<CategorySearch>> {
    const response = await apiClient.get<Page<CategorySearch>>(`${this.basePath}`, {
      params: {
        categoryType: categoryType || undefined,
        page,
        size
      }
    });
    return response.data;
  }

  async createCategory(payload: CategoryDTO): Promise<CleanCategoryDTO> {
    const response = await apiClient.post<CleanCategoryDTO>(`${this.basePath}/create`, payload);
    return response.data;
  }

  async updateCategory(id: number, payload: CategoryDTO): Promise<CleanCategoryDTO> {
    const response = await apiClient.put<CleanCategoryDTO>(`${this.basePath}/${id}`, payload);
    return response.data;
  }

  async deleteCategory(payload: CategoryDTO): Promise<void> {
    await apiClient.delete<void>(`${this.basePath}/${payload.id}`, { data: payload });
  }
}
