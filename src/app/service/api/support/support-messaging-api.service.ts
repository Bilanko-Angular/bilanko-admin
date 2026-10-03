import { Injectable } from '@angular/core';
import { apiClient } from '../../../core/axios/axios.config';
import { environment } from '../../../../environments/environment';
import { Page } from '../../../models/DTO/template/page';
import {
  SendMessageRequest,
  SupportConversationDTO,
  SupportMessageDTO,
  TransferConversationRequest,
} from '../../../models/DTO/support/SupportMessagingDTOs';

@Injectable({ providedIn: 'root' })
export class SupportMessagingApiService {
  private readonly basePath = environment.baseApiUrl + '/support';

  async getConversations(page = 0, size = 10): Promise<Page<SupportConversationDTO>> {
    const response = await apiClient.get<Page<SupportConversationDTO>>(
      `${this.basePath}/conversations`,
      { params: { page, size } },
    );
    return response.data;
  }

  async getConversation(id: number): Promise<SupportConversationDTO> {
    const response = await apiClient.get<SupportConversationDTO>(
      `${this.basePath}/conversations/${id}`,
    );
    return response.data;
  }

  async getMessages(page: number, size: number, id: number): Promise<Page<SupportMessageDTO>> {
    const response = await apiClient.get<Page<SupportMessageDTO>>(
      `${this.basePath}/conversations/${id}/messages`,
      { params: { page, size } },
    );
    return response.data;
  }

  async sendMessage(id: number, payload: SendMessageRequest): Promise<SupportMessageDTO> {
    const response = await apiClient.post<SupportMessageDTO>(
      `${this.basePath}/conversations/${id}/messages`,
      payload,
    );
    return response.data;
  }

  async claim(token: string): Promise<SupportConversationDTO> {
    const response = await apiClient.post<SupportConversationDTO>(
      `${this.basePath}/conversations/claim/${encodeURIComponent(token)}`,
    );
    return response.data;
  }

  async transfer(
    id: number,
    payload: TransferConversationRequest,
  ): Promise<SupportConversationDTO> {
    const response = await apiClient.post<SupportConversationDTO>(
      `${this.basePath}/conversations/${id}/transfer`,
      payload,
    );
    return response.data;
  }
}
