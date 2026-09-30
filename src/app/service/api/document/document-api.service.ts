import { Injectable } from '@angular/core';
import { apiClient } from '../../../core/axios/axios.config';
import { environment } from '../../../../environments/environment';
import { Page } from '../../../models/DTO/template/page';
import {
  AdminDocumentCreateRequest,
  AdminDocumentResponseDTO,
  AdminDocumentSummaryDTO,
  AdminDocumentUpdateRequest
} from '../../../models/DTO/document/DocumentDTOs';

export interface SearchDocumentParams {
  keyword?: string;
  type?: string;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentApiService {
  private readonly basePath = environment.baseApiUrl + '/admin/documents';

  async getSummary(): Promise<AdminDocumentSummaryDTO> {
    const response = await apiClient.get<AdminDocumentSummaryDTO>(`${this.basePath}/summary`);
    return response.data;
  }

  async search(params: SearchDocumentParams): Promise<Page<AdminDocumentResponseDTO>> {
    const response = await apiClient.get<Page<AdminDocumentResponseDTO>>(`${this.basePath}/search`, {
      params: {
        keyword: params.keyword || undefined,
        type: params.type || undefined,
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    });
    return response.data;
  }

  async getPagedDocuments(page: number = 0, size: number = 10): Promise<Page<AdminDocumentResponseDTO>> {
    const response = await apiClient.get<Page<AdminDocumentResponseDTO>>(`${this.basePath}`, {
      params: { page, size }
    });
    return response.data;
  }

  async getById(id: number): Promise<AdminDocumentResponseDTO> {
    const response = await apiClient.get<AdminDocumentResponseDTO>(`${this.basePath}/${id}`);
    return response.data;
  }

  async createDocument(payload: AdminDocumentCreateRequest): Promise<AdminDocumentResponseDTO> {
    const response = await apiClient.post<AdminDocumentResponseDTO>(`${this.basePath}`, payload);
    return response.data;
  }

  async updateDocument(id: number, payload: AdminDocumentUpdateRequest): Promise<AdminDocumentResponseDTO> {
    const response = await apiClient.put<AdminDocumentResponseDTO>(`${this.basePath}/${id}`, payload);
    return response.data;
  }

  async deleteDocument(id: number): Promise<void> {
    await apiClient.delete<void>(`${this.basePath}/${id}`);
  }
}
