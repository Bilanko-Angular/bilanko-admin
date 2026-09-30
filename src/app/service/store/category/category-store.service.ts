import { computed, inject, Injectable, signal } from '@angular/core';
import { AdminCategory } from '../../../models/category/admin-category';
import { CategoryApiService, SearchCategoryParams } from '../../api/category/category-api.service';
import { CategoryMapper } from '../../../mapper/CategoryMapper';
import {
  CategoryDTO,
  CategorySearch,
  CategorySummaryDTO,
  CategoryType,
  CleanCategoryDTO
} from '../../../models/DTO/category/CategoryDTOs';
import { Page } from '../../../models/DTO/template/page';

@Injectable({ providedIn: 'root' })
export class CategoryStoreService {
  private readonly apiService = inject(CategoryApiService);

  private readonly _categories = signal<AdminCategory[]>([]);
  private readonly _actualIndex = signal<number>(0);
  private readonly _totalPage = signal<number>(0);
  private readonly _totalElements = signal<number>(0);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  private readonly _summary = signal<CategorySummaryDTO | null>(null);

  private readonly pageSize = 10;

  readonly categories = this._categories.asReadonly();
  readonly actualIndex = this._actualIndex.asReadonly();
  readonly totalPage = this._totalPage.asReadonly();
  readonly totalElements = this._totalElements.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly summaryData = this._summary.asReadonly();

  readonly isEmpty = computed(() => this._categories().length === 0);
  // readonly hasNextPage = computed(() => this._actualIndex() < this._totalPage() - 1);
  // readonly hasPreviousPage = computed(() => this._actualIndex() > 0);

  private readonly _charges = signal<CleanCategoryDTO[]>([]);
  readonly charges = this._charges.asReadonly();

  async loadCharges(): Promise<void> {
    try {
      this._charges.set(await this.apiService.findAllByType(CategoryType.CHARGE));
    } catch (error) {
      console.error('[CategoryStore] find error', error);
      this._charges.set([]);
    }
  }
  async search(params: SearchCategoryParams): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const response = await this.apiService.search(params);
      this.applyPage(response);
      this._actualIndex.set(params.page ?? 0);
    } catch (error) {
      console.error('[CategoryStore] search error', error);
      this._error.set('Erreur lors de la recherche des catégories');
      this._categories.set([]);
      this._totalPage.set(0);
      this._totalElements.set(0);
    } finally {
      this._isLoading.set(false);
    }
  }

  async loadPage(categoryType?: CategoryType, page: number = 0, size: number = this.pageSize): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const response = await this.apiService.getAll(categoryType, page, size);
      this.applyPage(response);
      this._actualIndex.set(page);
    } catch (error) {
      console.error('[CategoryStore] loadPage error', error);
      this._error.set('Erreur lors du chargement de la page');
      this._categories.set([]);
    } finally {
      this._isLoading.set(false);
    }
  }

  async summary(): Promise<void> {
    try {
      const data = await this.apiService.getSummary();
      this._summary.set(data);
    } catch (error) {
      console.error('[CategoryStore] summary error', error);
      this._summary.set(null);
    }
  }

  async add(payload: CategoryDTO): Promise<AdminCategory | null> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      await this.apiService.createCategory(payload);
      // Backend returns CleanCategoryDTO. We need to convert it or reload the page.
      // Easiest is to reload the current page.
      await this.loadPage(undefined, this._actualIndex(), this.pageSize);
      await this.summary(); // update stats

      // We don't have all data in CleanCategoryDTO to convert to AdminCategory perfectly,
      // but returning a mapped version could be done. We'll return null and rely on the reload.
      return null;
    } catch (error) {
      console.error('[CategoryStore] add error', error);
      this._error.set('Erreur lors de la création de la catégorie');
      return null;
    } finally {
      this._isLoading.set(false);
    }
  }

  async updateCategory(id: number, payload: CategoryDTO): Promise<AdminCategory | null> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      await this.apiService.updateCategory(id, payload);
      await this.loadPage(undefined, this._actualIndex(), this.pageSize);
      return null;
    } catch (error) {
      console.error('[CategoryStore] update error', error);
      this._error.set('Erreur lors de la mise à jour de la catégorie');
      return null;
    } finally {
      this._isLoading.set(false);
    }
  }

  async deleteCategory(payload: CategoryDTO): Promise<boolean> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      await this.apiService.deleteCategory(payload);
      await this.loadPage(undefined, this._actualIndex(), this.pageSize);
      await this.summary();
      return true;
    } catch (error) {
      console.error('[CategoryStore] delete error', error);
      this._error.set('Erreur lors de la suppression de la catégorie');
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  clearError(): void {
    this._error.set(null);
  }

  reset(): void {
    this._categories.set([]);
    this._actualIndex.set(0);
    this._totalPage.set(0);
    this._totalElements.set(0);
    this._isLoading.set(false);
    this._error.set(null);
  }

  private applyPage(response: Page<CategorySearch>): void {
    this._categories.set(
      response.content.map(CategoryMapper.dtoToAdminCategory)
    );
    this._totalPage.set(response.totalPages);
    this._totalElements.set(response.totalElements);
  }
}
