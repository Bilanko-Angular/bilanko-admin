import { computed, inject, Injectable, signal } from '@angular/core';
import { AdminDocument } from '../../../models/document/admin-document';
import { DocumentApiService, SearchDocumentParams } from '../../api/document/document-api.service';
import { DocumentMapper } from '../../../mapper/DocumentMapper';
import { AdminDocumentCreateRequest, AdminDocumentResponseDTO, AdminDocumentSummaryDTO, AdminDocumentUpdateRequest } from '../../../models/DTO/document/DocumentDTOs';
import { Page } from '../../../models/DTO/template/page';

@Injectable({ providedIn: 'root' })
export class DocumentStoreService {
  private readonly apiService = inject(DocumentApiService);

  private readonly _documents = signal<AdminDocument[]>([]);
  private readonly _actualIndex = signal<number>(0);
  private readonly _totalPage = signal<number>(0);
  private readonly _totalElements = signal<number>(0);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  private readonly _summary = signal<AdminDocumentSummaryDTO | null>(null);

  private readonly pageSize = 10;

  readonly documents = this._documents.asReadonly();
  readonly actualIndex = this._actualIndex.asReadonly();
  readonly totalPage = this._totalPage.asReadonly();
  readonly totalElements = this._totalElements.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly summaryData = this._summary.asReadonly();

  readonly isEmpty = computed(() => this._documents().length === 0);
  readonly hasNextPage = computed(() => this._actualIndex() < this._totalPage() - 1);
  readonly hasPreviousPage = computed(() => this._actualIndex() > 0);

  async search(params: SearchDocumentParams): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const response = await this.apiService.search(params);
      this.applyPage(response);
      this._actualIndex.set(params.page ?? 0);
    } catch (error) {
      console.error('[DocumentStore] search error', error);
      this._error.set('Erreur lors de la recherche des documents');
      this._documents.set([]);
      this._totalPage.set(0);
      this._totalElements.set(0);
    } finally {
      this._isLoading.set(false);
    }
  }

  async loadPage(page: number = 0, size: number = this.pageSize): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const response = await this.apiService.getPagedDocuments(page, size);
      this.applyPage(response);
      this._actualIndex.set(page);
    } catch (error) {
      console.error('[DocumentStore] loadPage error', error);
      this._error.set('Erreur lors du chargement des documents');
      this._documents.set([]);
    } finally {
      this._isLoading.set(false);
    }
  }

  async summary(): Promise<void> {
    try {
      const data = await this.apiService.getSummary();
      this._summary.set(data);
    } catch (error) {
      console.error('[DocumentStore] summary error', error);
      this._summary.set(null);
    }
  }

  async add(payload: AdminDocumentCreateRequest): Promise<AdminDocument | null> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const response = await this.apiService.createDocument(payload);
      const newDoc = DocumentMapper.dtoToAdminDocument(response);

      this._documents.update(list => [newDoc, ...list]);
      this._totalElements.update(t => t + 1);
      
      await this.summary();

      return newDoc;
    } catch (error) {
      console.error('[DocumentStore] add error', error);
      this._error.set('Erreur lors de la création du document');
      return null;
    } finally {
      this._isLoading.set(false);
    }
  }

  async update(id: number, payload: AdminDocumentUpdateRequest): Promise<AdminDocument | null> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const response = await this.apiService.updateDocument(id, payload);
      const updated = DocumentMapper.dtoToAdminDocument(response);

      this._documents.update(list =>
        list.map(d => (d.id === id ? updated : d))
      );
      
      await this.summary();

      return updated;
    } catch (error) {
      console.error('[DocumentStore] update error', error);
      this._error.set('Erreur lors de la mise à jour du document');
      return null;
    } finally {
      this._isLoading.set(false);
    }
  }

  async delete(id: number): Promise<boolean> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      await this.apiService.deleteDocument(id);

      this._documents.update(list => list.filter(d => d.id !== id));
      this._totalElements.update(t => Math.max(0, t - 1));
      
      await this.summary();

      return true;
    } catch (error) {
      console.error('[DocumentStore] delete error', error);
      this._error.set('Erreur lors de la suppression du document');
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  clearError(): void {
    this._error.set(null);
  }

  reset(): void {
    this._documents.set([]);
    this._actualIndex.set(0);
    this._totalPage.set(0);
    this._totalElements.set(0);
    this._isLoading.set(false);
    this._error.set(null);
  }

  private applyPage(response: Page<AdminDocumentResponseDTO>): void {
    this._documents.set(
      response.content.map(DocumentMapper.dtoToAdminDocument)
    );
    this._totalPage.set(response.totalPages);
    this._totalElements.set(response.totalElements);
  }
}
