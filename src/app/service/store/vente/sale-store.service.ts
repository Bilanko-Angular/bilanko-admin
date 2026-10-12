import { computed, inject, Injectable, signal } from '@angular/core';
import { AdminSale } from '../../../models/sale/admin-sale';
import { VenteApiService, SearchSaleParams } from '../../api/vente/vente-api.service';
import { SaleMapper } from '../../../mapper/SaleMapper';
import { AdminSaleCreateRequest, AdminSaleResponseDTO, AdminSaleSummaryDTO, AdminSaleUpdateRequest } from '../../../models/DTO/sale/SaleDTOs';
import { Page } from '../../../models/DTO/template/page';

@Injectable({ providedIn: 'root' })
export class SaleStoreService {
  private readonly apiService = inject(VenteApiService);

  private readonly _sales = signal<AdminSale[]>([]);
  private readonly _actualIndex = signal<number>(0);
  private readonly _totalPage = signal<number>(0);
  private readonly _totalElements = signal<number>(0);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  private readonly _summary = signal<AdminSaleSummaryDTO | null>(null);

  private readonly pageSize = 10;

  readonly sales = this._sales.asReadonly();
  readonly actualIndex = this._actualIndex.asReadonly();
  readonly totalPage = this._totalPage.asReadonly();
  readonly totalElements = this._totalElements.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly summaryData = this._summary.asReadonly();

  readonly isEmpty = computed(() => this._sales().length === 0);
  readonly hasNextPage = computed(() => this._actualIndex() < this._totalPage() - 1);
  readonly hasPreviousPage = computed(() => this._actualIndex() > 0);

  async search(params: SearchSaleParams): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const response = await this.apiService.search(params);
      this.applyPage(response);
      this._actualIndex.set(params.page ?? 0);
    } catch (error) {
      console.error('[SaleStore] search error', error);
      this._error.set('Erreur lors de la recherche des ventes');
      this._sales.set([]);
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
      const response = await this.apiService.getPagedSales(page, size);
      this.applyPage(response);
      this._actualIndex.set(page);
    } catch (error) {
      console.error('[SaleStore] loadPage error', error);
      this._error.set('Erreur lors du chargement des ventes');
      this._sales.set([]);
    } finally {
      this._isLoading.set(false);
    }
  }

  async summary(): Promise<void> {
    try {
      const data = await this.apiService.getSummary();
      this._summary.set(data);
    } catch (error) {
      console.error('[SaleStore] summary error', error);
      this._summary.set(null);
    }
  }

  async add(payload: AdminSaleCreateRequest): Promise<AdminSale | null> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const response = await this.apiService.createSale(payload);
      const newSale = SaleMapper.dtoToAdminSale(response);

      this._sales.update(list => [newSale, ...list]);
      this._totalElements.update(t => t + 1);
      
      await this.summary();

      return newSale;
    } catch (error) {
      console.error('[SaleStore] add error', error);
      this._error.set('Erreur lors de la création de la vente');
      return null;
    } finally {
      this._isLoading.set(false);
    }
  }

  async update(id: number, payload: AdminSaleUpdateRequest): Promise<AdminSale | null> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const response = await this.apiService.updateSale(id, payload);
      const updated = SaleMapper.dtoToAdminSale(response);

      this._sales.update(list =>
        list.map(s => (s.id === id ? updated : s))
      );
      
      await this.summary();

      return updated;
    } catch (error) {
      console.error('[SaleStore] update error', error);
      this._error.set('Erreur lors de la mise à jour de la vente');
      return null;
    } finally {
      this._isLoading.set(false);
    }
  }

  async delete(id: number): Promise<boolean> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      await this.apiService.deleteSale(id);

      this._sales.update(list => list.filter(s => s.id !== id));
      this._totalElements.update(t => Math.max(0, t - 1));
      
      await this.summary();

      return true;
    } catch (error) {
      console.error('[SaleStore] delete error', error);
      this._error.set('Erreur lors de la suppression de la vente');
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  clearError(): void {
    this._error.set(null);
  }

  reset(): void {
    this._sales.set([]);
    this._actualIndex.set(0);
    this._totalPage.set(0);
    this._totalElements.set(0);
    this._isLoading.set(false);
    this._error.set(null);
  }

  private applyPage(response: Page<AdminSaleResponseDTO>): void {
    this._sales.set(
      response.content.map(SaleMapper.dtoToAdminSale)
    );
    this._totalPage.set(response.totalPages);
    this._totalElements.set(response.totalElements);
  }
}
