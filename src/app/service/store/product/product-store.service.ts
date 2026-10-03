import { computed, inject, Injectable, signal } from '@angular/core';
import { AdminProduct } from '../../../models/product/adminProduct';
import { ProductApiService, SearchProductParams } from '../../api/product/product-api.service';
import { ProductMapper } from '../../../mapper/ProductMapper';
import { AdminProductSummaryDTO } from '../../../models/DTO/product/AdminProductSummaryDTO';
import { AdminProductCreateRequest } from '../../../models/DTO/product/AdminProductCreateRequest';
import { AdminProductUpdateRequest } from '../../../models/DTO/product/AdminProductUpdateRequest';
import { Page } from '../../../models/DTO/template/page';
import { AdminProductResponseDTO } from '../../../models/DTO/product/AdminProductResponseDTO';

@Injectable({ providedIn: 'root' })
export class ProductStoreService {
  private readonly productApiService = inject(ProductApiService);

  // ---- État privé (signaux) ----
  private readonly _products    = signal<AdminProduct[]>([]);
  private readonly _actualIndex = signal<number>(0);
  private readonly _totalPage   = signal<number>(0);
  private readonly _totalProduct = signal<number>(0);
  private readonly _isLoading   = signal<boolean>(false);
  private readonly _error       = signal<string | null>(null);
  private readonly pageSize     = 10;

  // ---- API publique (lecture seule) ----
  readonly products      = this._products.asReadonly();
  readonly actualIndex   = this._actualIndex.asReadonly();
  readonly totalPage     = this._totalPage.asReadonly();
  readonly totalProduct  = this._totalProduct.asReadonly();
  readonly isLoading     = this._isLoading.asReadonly();
  readonly error         = this._error.asReadonly();

  // ---- Computed utiles ----
  readonly isEmpty        = computed(() => this._products().length === 0);
  readonly hasNextPage    = computed(() => this._actualIndex() < this._totalPage() - 1);
  readonly hasPreviousPage = computed(() => this._actualIndex() > 0);

  // ============================================================
  //  RECHERCHE PAGINÉE
  // ============================================================
  async search(params: SearchProductParams): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      const response = await this.productApiService.search(params);
      this.applyPage(response);
      this._actualIndex.set(params.page ?? 0);
    } catch (error) {
      console.error('[ProductStore] search error', error);
      this._error.set('Erreur lors de la recherche des produits');
      this._products.set([]);
      this._totalPage.set(0);
      this._totalProduct.set(0);
    } finally {
      this._isLoading.set(false);
    }
  }

  // ============================================================
  //  LISTE PAGINÉE (sans filtre)
  // ============================================================
  async loadPage(page: number = 0, size: number = this.pageSize): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      const response = await this.productApiService.getPagedProducts(page, size);
      this.applyPage(response);
      this._actualIndex.set(page);
    } catch (error) {
      console.error('[ProductStore] loadPage error', error);
      this._error.set('Erreur lors du chargement de la page');
      this._products.set([]);
    } finally {
      this._isLoading.set(false);
    }
  }

  // ============================================================
  //  RÉSUMÉ (stats)
  // ============================================================
  async summary(): Promise<AdminProductSummaryDTO> {
    try {
      return await this.productApiService.getSummary();
    } catch (error) {
      console.error('[ProductStore] summary error', error);
      return { totalCount: 0, addedThisMonthCount: 0, associatedWithSaleCount: 0, averagePrice: 0 };
    }
  }

  // ============================================================
  //  CRÉATION
  // ============================================================
  async add(payload: AdminProductCreateRequest): Promise<AdminProduct | null> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      const response = await this.productApiService.createProduct(payload);
      const newProduct = ProductMapper.dtoToAdminProduct(response);
      this._products.update(list => [newProduct, ...list]);
      this._totalProduct.update(t => t + 1);
      return newProduct;
    } catch (error) {
      console.error('[ProductStore] add error', error);
      this._error.set('Erreur lors de la création du produit');
      return null;
    } finally {
      this._isLoading.set(false);
    }
  }

  // ============================================================
  //  MISE À JOUR
  // ============================================================
  async update(id: number, payload: AdminProductUpdateRequest): Promise<AdminProduct | null> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      const response = await this.productApiService.updateProduct(id, payload);
      const updated = ProductMapper.dtoToAdminProduct(response);
      this._products.update(list => list.map(p => (p.id === id ? updated : p)));
      return updated;
    } catch (error) {
      console.error('[ProductStore] update error', error);
      this._error.set('Erreur lors de la mise à jour du produit');
      return null;
    } finally {
      this._isLoading.set(false);
    }
  }

  // ============================================================
  //  SUPPRESSION
  // ============================================================
  async delete(id: number): Promise<boolean> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      await this.productApiService.deleteProduct(id);
      this._products.update(list => list.filter(p => p.id !== id));
      this._totalProduct.update(t => Math.max(0, t - 1));
      return true;
    } catch (error) {
      console.error('[ProductStore] delete error', error);
      this._error.set('Erreur lors de la suppression du produit');
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  // ============================================================
  //  UTILITAIRES
  // ============================================================
  clearError(): void { this._error.set(null); }

  reset(): void {
    this._products.set([]);
    this._actualIndex.set(0);
    this._totalPage.set(0);
    this._totalProduct.set(0);
    this._isLoading.set(false);
    this._error.set(null);
  }

  // ============================================================
  //  PRIVÉ
  // ============================================================
  private applyPage(response: Page<AdminProductResponseDTO>): void {
    this._products.set(response.content.map(ProductMapper.dtoToAdminProduct));
    this._totalPage.set(response.totalPages);
    this._totalProduct.set(response.totalElements);
  }
}
