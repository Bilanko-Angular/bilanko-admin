import { computed, inject, Injectable, signal } from '@angular/core';
import { SupportMessagingMapper } from '../../../mapper/SupportMessagingMapper';
import { Conversation, Message } from '../../../models/messaging';
import { SupportMessagingApiService } from '../../api/support/support-messaging-api.service';
import { Page } from '../../../models/DTO/template/page';
import { SupportMessageDTO } from '../../../models/DTO/support/SupportMessagingDTOs';

@Injectable({ providedIn: 'root' })
export class SupportMessagingStoreService {
  private readonly api = inject(SupportMessagingApiService);
  private readonly pageSize = 10;
  private readonly _conversations = signal<Conversation[]>([]);
  private readonly _messages = signal<Record<string, Message[]>>({});
  private readonly _actualIndex = signal(0);
  private readonly _totalPage = signal(0);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly conversations = this._conversations.asReadonly();
  readonly actualIndex = this._actualIndex.asReadonly();
  readonly totalPage = this._totalPage.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly hasNextPage = computed(() => this._actualIndex() < this._totalPage() - 1);

  async loadPage(page = 0, size = this.pageSize): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      const response = await this.api.getConversations(page, size);
      this._conversations.set(
        response.content.map((dto) => SupportMessagingMapper.conversationFromDto(dto)),
      );
      this._actualIndex.set(page);
      this._totalPage.set(response.totalPages);
    } catch (error) {
      console.error('[SupportMessagingStore] load conversations error', error);
      this._error.set('Erreur lors du chargement des conversations');
      this._conversations.set([]);
    } finally {
      this._isLoading.set(false);
    }
  }

  messagesDe(conversationId: string) {
    return computed(() => this._messages()[conversationId] ?? []);
  }

  async loadConversation(id: string): Promise<Conversation | null> {
    try {
      const conversation = SupportMessagingMapper.conversationFromDto(
        await this.api.getConversation(Number(id)),
      );
      this.upsertConversation(conversation);
      return conversation;
    } catch (error) {
      console.error('[SupportMessagingStore] load conversation error', error);
      this._error.set('Erreur lors du chargement de la conversation');
      return null;
    }
  }

  async loadMessages(id: string, page = 0, size = this.pageSize): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      const response = await this.api.getMessages(page, size, Number(id));
      const messages = this.mapMessages(response, id);
      this._messages.update((current) => ({
        ...current,
        [id]: messages.sort((a, b) => a.envoyeLe.localeCompare(b.envoyeLe)),
      }));
    } catch (error) {
      console.error('[SupportMessagingStore] load messages error', error);
      this._error.set('Erreur lors du chargement des messages');
      this._messages.update((current) => ({ ...current, [id]: [] }));
    } finally {
      this._isLoading.set(false);
    }
  }

  async sendMessage(id: string, content: string): Promise<boolean> {
    const conversation = this._conversations().find((item) => item.id === id);
    if (!conversation?.canWrite || !content.trim()) return false;

    try {
      const response = await this.api.sendMessage(Number(id), { content: content.trim() });
      const message = SupportMessagingMapper.messageFromDto(response, id);
      this._messages.update((current) => ({
        ...current,
        [id]: [...(current[id] ?? []), message],
      }));
      this._conversations.update((list) =>
        list.map((item) =>
          item.id === id
            ? {
                ...item,
                dernierMessage: message.contenu,
                dernierMessageLe: message.envoyeLe,
              }
            : item,
        ),
      );
      return true;
    } catch (error) {
      console.error('[SupportMessagingStore] send message error', error);
      this._error.set("Erreur lors de l'envoi du message");
      return false;
    }
  }

  async claim(token: string): Promise<Conversation | null> {
    this._error.set(null);
    try {
      const conversation = SupportMessagingMapper.conversationFromDto(await this.api.claim(token));
      this.upsertConversation(conversation);
      return conversation;
    } catch (error: unknown) {
      console.error('[SupportMessagingStore] claim error', error);
      const status = this.extractHttpStatus(error);
      if (status === 409 || status === 410) {
        this._error.set("Ce lien de prise en main n'est plus valide");
      } else if (status === 403) {
        this._error.set('Ce transfert ne vous est pas destiné');
      } else {
        this._error.set('Erreur lors de la prise en charge');
      }
      return null;
    }
  }

  async transfer(id: string, adminEmail: string): Promise<boolean> {
    this._error.set(null);
    try {
      const conversation = SupportMessagingMapper.conversationFromDto(
        await this.api.transfer(Number(id), { adminEmail: adminEmail.trim() }),
      );
      this.upsertConversation(conversation);
      return true;
    } catch (error) {
      console.error('[SupportMessagingStore] transfer error', error);
      this._error.set('Erreur lors du transfert de la conversation');
      return false;
    }
  }

  markAsRead(id: string): void {
    this._conversations.update((list) =>
      list.map((item) => (item.id === id ? { ...item, nonLus: 0 } : item)),
    );
  }

  private upsertConversation(conversation: Conversation): void {
    this._conversations.update((list) => {
      const index = list.findIndex((item) => item.id === conversation.id);
      if (index === -1) {
        return [conversation, ...list];
      }
      const next = [...list];
      next[index] = { ...next[index], ...conversation };
      return next;
    });
  }

  private mapMessages(page: Page<SupportMessageDTO>, conversationId: string): Message[] {
    return page.content.map((message) =>
      SupportMessagingMapper.messageFromDto(message, conversationId),
    );
  }

  private extractHttpStatus(error: unknown): number | null {
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response?: { status?: number } }).response;
      return response?.status ?? null;
    }
    return null;
  }
}
