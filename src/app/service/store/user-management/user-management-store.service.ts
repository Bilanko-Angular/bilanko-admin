import {computed, inject, Injectable, signal} from '@angular/core';
import {AdminUser} from '../../../models/user-management/admin-user';
import {SearchUserParams, UserManagentApiService} from '../../api/user-management/user-managent-api.service';
import {UserManagerMapper} from '../../../mapper/UserManagerMapper';
import {AdminSummaryDTO} from '../../../models/DTO/user-management/AdminSummaryDTO';
import {AdminUserCreateRequest} from '../../../models/DTO/user-management/AdminUserCreateRequest';
import {AdminUserUpdateRequest} from '../../../models/DTO/user-management/AdminUserUpdateRequest';
import {Page} from '../../../models/DTO/template/page';
import {AdminUserResponseDTO} from '../../../models/DTO/user-management/AdminUserResponseDTO';

@Injectable({ providedIn: 'root' })
export class UserManagementStoreService {
  private readonly userManagementApiService = inject(UserManagentApiService);

  // ---- État privé (signaux) ----
  private readonly _users = signal<AdminUser[]>([]);
  private readonly _actualIndex = signal<number>(0);
  private readonly _totalPage = signal<number>(0);
  private readonly _totalUser = signal<number>(0);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly pageSize = 10;

  // ---- API publique (lecture seule) ----
  readonly users = this._users.asReadonly();
  readonly actualIndex = this._actualIndex.asReadonly();
  readonly totalPage = this._totalPage.asReadonly();
  readonly totalUser = this._totalUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // ---- Computed utiles ----
  readonly isEmpty = computed(() => this._users().length === 0);
  readonly hasNextPage = computed(() => this._actualIndex() < this._totalPage() - 1);
  readonly hasPreviousPage = computed(() => this._actualIndex() > 0);

  // ============================================================
  //  RECHERCHE PAGINÉE
  // ============================================================
  async search(params: SearchUserParams): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const reponse = await this.userManagementApiService.search(params);
      this.applyPage(reponse);
      this._actualIndex.set(params.page ?? 0);
    } catch (error) {
      console.error('[UserManagementStore] search error', error);
      this._error.set('Erreur lors du chargement des utilisateurs');
      this._users.set([]);
      this._totalPage.set(0);
      this._totalUser.set(0);
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
      const reponse = await this.userManagementApiService.getPagedUsers(page, size);
      this.applyPage(reponse);
      this._actualIndex.set(page);
    } catch (error) {
      console.error('[UserManagementStore] loadPage error', error);
      this._error.set('Erreur lors du chargement de la page');
      this._users.set([]);
    } finally {
      this._isLoading.set(false);
    }
  }

  // ============================================================
  //  TOUS LES UTILISATEURS (sans pagination)
  // ============================================================
  async loadAll(): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const reponse = await this.userManagementApiService.getAllUsers();
      this._users.set(reponse.map(UserManagerMapper.dtoAdmintoAdminuser));
      // Pas de pagination dans ce cas
      this._actualIndex.set(0);
      this._totalPage.set(1);
      this._totalUser.set(reponse.length);
    } catch (error) {
      console.error('[UserManagementStore] loadAll error', error);
      this._error.set('Erreur lors du chargement des utilisateurs');
      this._users.set([]);
    } finally {
      this._isLoading.set(false);
    }
  }

  // ============================================================
  //  RÉSUMÉ (stats)
  // ============================================================
  async summary(): Promise<AdminSummaryDTO> {
    try {
      return await this.userManagementApiService.getSummary();
    } catch (error) {
      console.error('[UserManagementStore] summary error', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        blockedUsers: 0,
        newUsersThisMonth: 0,
      };
    }
  }

  // ============================================================
  //  CRÉATION
  // ============================================================
  async add(payload: AdminUserCreateRequest): Promise<AdminUser | null> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const reponse = await this.userManagementApiService.createUser(payload);
      const newUser = UserManagerMapper.dtoAdmintoAdminuser(reponse);

      // ✅ Immuable : nouveau tableau → le signal notifie Angular
      this._users.update(list => [newUser, ...list]);
      this._totalUser.update(t => t + 1);

      return newUser;
    } catch (error) {
      console.error('[UserManagementStore] add error', error);
      this._error.set('Erreur lors de la création de l\'utilisateur');
      return null;
    } finally {
      this._isLoading.set(false);
    }
  }

  // ============================================================
  //  MISE À JOUR
  // ============================================================
  async update(id: number, payload: AdminUserUpdateRequest): Promise<AdminUser | null> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const reponse = await this.userManagementApiService.updateUser(id, payload);
      const updated = UserManagerMapper.dtoAdmintoAdminuser(reponse);

      // ✅ map retourne une nouvelle liste, sans réassigner le paramètre
      this._users.update(list =>
        list.map(u => (u.id === id ? updated : u))
      );

      return updated;
    } catch (error) {
      console.error('[UserManagementStore] update error', error);
      this._error.set('Erreur lors de la mise à jour de l\'utilisateur');
      return null;
    } finally {
      this._isLoading.set(false);
    }
  }

  // ============================================================
  //  CHANGEMENT DE STATUT (bloqué / actif)
  // ============================================================
  async toggleBlock(id: number): Promise<AdminUser | null> {
    const current = this._users().find(u => u.id === id);
    if (!current) {
      console.warn(`[UserManagementStore] toggleBlock: user ${id} introuvable`);
      return null;
    }

    const actual = current.status === "active" ;
    const newActive=!actual
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const reponse = await this.userManagementApiService.updateUserStatus(id, newActive);
      const updated = UserManagerMapper.dtoAdmintoAdminuser(reponse);

      this._users.update(list =>
        list.map(u => (u.id === id ? updated : u))
      );

      return updated;
    } catch (error) {
      console.error('[UserManagementStore] toggleBlock error', error);
      this._error.set('Erreur lors du changement de statut');
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
      await this.userManagementApiService.deleteUser(id);

      // ✅ filter retourne une nouvelle liste
      this._users.update(list => list.filter(u => u.id !== id));
      this._totalUser.update(t => Math.max(0, t - 1));

      return true;
    } catch (error) {
      console.error('[UserManagementStore] delete error', error);
      this._error.set('Erreur lors de la suppression de l\'utilisateur');
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
    this._users.set([]);
    this._actualIndex.set(0);
    this._totalPage.set(0);
    this._totalUser.set(0);
    this._isLoading.set(false);
    this._error.set(null);
  }

  // ============================================================
  //  PRIVÉ
  // ============================================================
  private applyPage(reponse: Page<AdminUserResponseDTO>): void {
    this._users.set(
      reponse.content.map(UserManagerMapper.dtoAdmintoAdminuser)
    );
    this._totalPage.set(reponse.totalPages);
    // ✅ totalElements = total global, pas numberOfElements (page courante)
    this._totalUser.set(reponse.totalElements);
  }
}
