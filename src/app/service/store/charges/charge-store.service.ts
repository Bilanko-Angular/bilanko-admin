import { computed, inject, Injectable, signal } from '@angular/core';
import { AdminCharge } from '../../../models/charge/adminCharge';
import { ChargeApiService, SearchChargeParams } from '../../api/charge/charge-api.service';
import { ChargeMapper } from '../../../mapper/ChargeMapper';
import { AdminChargeSummaryDTO } from '../../../models/DTO/charge/AdminChargeSummaryDTO';
import { AdminChargeCreateRequest } from '../../../models/DTO/charge/AdminChargeCreateRequest';
import { AdminChargeUpdateRequest } from '../../../models/DTO/charge/AdminChargeUpdateRequest';
import { Page } from '../../../models/DTO/template/page';
import { AdminChargeResponseDTO } from '../../../models/DTO/charge/AdminChargeResponseDTO';

@Injectable({ providedIn: 'root' })
export class ChargeStoreService {
  private readonly chargeApiService = inject(ChargeApiService);

  // ---- État privé (signaux) ----
  private readonly _charges = signal<AdminCharge[]>([]);
  private readonly _actualIndex = signal<number>(0);
  private readonly _totalPage = signal<number>(0);
  private readonly _totalCharge = signal<number>(0);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly pageSize = 10;

  // ---- API publique (lecture seule) ----
  readonly charges = this._charges.asReadonly();
  readonly actualIndex = this._actualIndex.asReadonly();
  readonly totalPage = this._totalPage.asReadonly();
  readonly totalCharge = this._totalCharge.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // ---- Computed utiles ----
  readonly isEmpty = computed(() => this._charges().length === 0);
  readonly hasNextPage = computed(() => this._actualIndex() < this._totalPage() - 1);
  readonly hasPreviousPage = computed(() => this._actualIndex() > 0);

  // ============================================================
  //  RECHERCHE PAGINÉE
  // ============================================================
  async search(params: SearchChargeParams): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const reponse = await this.chargeApiService.search(params);
      this.applyPage(reponse);
      this._actualIndex.set(params.page ?? 0);
    } catch (error) {
      console.error('[ChargeStore] search error', error);
      this._error.set('Erreur lors du chargement des charges');
      this._charges.set([]);
      this._totalPage.set(0);
      this._totalCharge.set(0);
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
      const reponse = await this.chargeApiService.getPagedCharges(page, size);
      this.applyPage(reponse);
      this._actualIndex.set(page);
    } catch (error) {
      console.error('[ChargeStore] loadPage error', error);
      this._error.set('Erreur lors du chargement de la page');
      this._charges.set([]);
    } finally {
      this._isLoading.set(false);
    }
  }

  // ============================================================
  //  RÉSUMÉ (stats)
  // ============================================================
  async summary(): Promise<AdminChargeSummaryDTO> {
    try {
      return await this.chargeApiService.getSummary();
    } catch (error) {
      console.error('[ChargeStore] summary error', error);
      return {
        totalCount: 0,
        totalSum: 0,
        currentMonthSum: 0,
        averagePrice: 0,
      };
    }
  }

  // ============================================================
  //  CRÉATION
  // ============================================================
  async add(payload: AdminChargeCreateRequest): Promise<AdminCharge | null> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const reponse = await this.chargeApiService.createCharge(payload);
      const newCharge = ChargeMapper.dtoToAdminCharge(reponse);

      this._charges.update(list => [newCharge, ...list]);
      this._totalCharge.update(t => t + 1);

      return newCharge;
    } catch (error) {
      console.error('[ChargeStore] add error', error);
      this._error.set('Erreur lors de la création de la charge');
      return null;
    } finally {
      this._isLoading.set(false);
    }
  }

  // ============================================================
  //  MISE À JOUR
  // ============================================================
  async update(id: number, payload: AdminChargeUpdateRequest): Promise<AdminCharge | null> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const reponse = await this.chargeApiService.updateCharge(id, payload);
      const updated = ChargeMapper.dtoToAdminCharge(reponse);

      this._charges.update(list =>
        list.map(c => (c.id === id ? updated : c))
      );

      return updated;
    } catch (error) {
      console.error('[ChargeStore] update error', error);
      this._error.set('Erreur lors de la mise à jour de la charge');
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
      await this.chargeApiService.deleteCharge(id);

      this._charges.update(list => list.filter(c => c.id !== id));
      this._totalCharge.update(t => Math.max(0, t - 1));

      return true;
    } catch (error) {
      console.error('[ChargeStore] delete error', error);
      this._error.set('Erreur lors de la suppression de la charge');
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  // ============================================================
  //  UTILITAIRES
  // ============================================================
  clearError(): void {
    this._error.set(null);
  }

  reset(): void {
    this._charges.set([]);
    this._actualIndex.set(0);
    this._totalPage.set(0);
    this._totalCharge.set(0);
    this._isLoading.set(false);
    this._error.set(null);
  }

  // ============================================================
  //  PRIVÉ
  // ============================================================
  private applyPage(reponse: Page<AdminChargeResponseDTO>): void {
    this._charges.set(reponse.content.map(ChargeMapper.dtoToAdminCharge));
    this._totalPage.set(reponse.totalPages);
    this._totalCharge.set(reponse.totalElements);
  }
}
