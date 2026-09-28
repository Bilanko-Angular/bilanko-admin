import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { UserManagementStoreService } from '../../service/store/user-management/user-management-store.service';
import { SearchService } from '../../services/search.service';
import { AdminUser } from '../../models/user-management/admin-user';
import { UserRole } from '../../models/type/user-role';
import { TimeAgoPipe } from '../../pipe/time-ago.pipe-pipe';
import { AdminSummaryDTO } from '../../models/DTO/user-management/AdminSummaryDTO';
import { AdminUserCreateRequest } from '../../models/DTO/user-management/AdminUserCreateRequest';
import { AdminUserUpdateRequest } from '../../models/DTO/user-management/AdminUserUpdateRequest';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, TimeAgoPipe],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  private readonly userService = inject(UserManagementStoreService);
  private readonly searchService = inject(SearchService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  private readonly searchTrigger$ = new Subject<string>();
  private readonly pageSize = 10;

  // ─── Store (lecture) ──────────────────────────────
  readonly users = this.userService.users;
  readonly isLoading = this.userService.isLoading;
  readonly error = this.userService.error;
  readonly totalPages = this.userService.totalPage;
  readonly totalUsers = this.userService.totalUser;
  readonly currentPageIndex = this.userService.actualIndex;

  // ─── Recherche & filtres ──────────────────────────
  get searchTerm() { return this.searchService.term; }
  statusFilter = signal<'all' | 'active' | 'blocked'>('all');
  roleFilter = signal<'all' | UserRole>('all');

  // ─── Statistiques ─────────────────────────────────
  stats = signal<AdminSummaryDTO>({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    newUsersThisMonth: 0,
  });
  statsLoading = signal(true);

  // ─── Skeletons ────────────────────────────────────
  readonly skeletonRows = Array.from({ length: 6 }, (_, i) => i);

  // ─── Modales ──────────────────────────────────────
  editingUser = signal<AdminUser | null>(null);
  viewingUser = signal<AdminUser | null>(null);
  showAddModal = signal(false);

  editForm = this.fb.group({
    name: ['', Validators.required],
    subname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    city: [''],
  });

  addForm = this.fb.group({
    name: ['', Validators.required],
    subname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    this.searchTrigger$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => void this.fetchUsers(0));

    void this.loadSummary();
    void this.fetchUsers();
  }

  // ─── Chargement ───────────────────────────────────
  private async loadSummary(): Promise<void> {
    this.statsLoading.set(true);
    const summary = await this.userService.summary();
    this.stats.set(summary);
    this.statsLoading.set(false);
  }

  private async fetchUsers(page = 0): Promise<void> {
    const keyword = this.searchTerm().trim() || undefined;
    const status = this.statusFilter();
    const role = this.roleFilter();

    const hasFilters = !!keyword || status !== 'all' || role !== 'all';

    if (hasFilters) {
      await this.userService.search({
        keyword,
        active: status === 'all' ? undefined : status === 'active',
        role: role === 'all' ? undefined : role,
        page,
        size: this.pageSize,
      });
    } else {
      await this.userService.loadPage(page, this.pageSize);
    }
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.searchTrigger$.next(value.trim());
  }

  onStatusFilterChange(value: 'all' | 'active' | 'blocked'): void {
    this.statusFilter.set(value);
    void this.fetchUsers(0);
  }

  onRoleFilterChange(value: 'all' | UserRole): void {
    this.roleFilter.set(value);
    void this.fetchUsers(0);
  }

  // ─── Actions ──────────────────────────────────────
  openEdit(user: AdminUser): void {
    this.editingUser.set(user);
    this.editForm.setValue({
      name: user.name,
      subname: user.subname,
      email: user.email,
      phone: user.phone ?? '',
      city: user.city ?? '',
    });
  }

  closeEdit(): void {
    this.editingUser.set(null);
  }

  async saveEdit(): Promise<void> {
    const user = this.editingUser();
    if (!user || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const f = this.editForm.getRawValue();
    const payload: AdminUserUpdateRequest = {
      name: f.name!,
      subname: f.subname!,
      email: f.email!,
      phoneNumber: f.phone || undefined,
      adresse: f.city || undefined,
    };

    const updated = await this.userService.update(user.id, payload);
    if (updated) {
      this.closeEdit();
      void this.loadSummary();
    }
  }

  openAdd(): void {
    this.addForm.reset();
    this.showAddModal.set(true);
  }

  closeAdd(): void {
    this.showAddModal.set(false);
  }

  async saveAdd(): Promise<void> {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    const f = this.addForm.getRawValue();
    const payload: AdminUserCreateRequest = {
      name: f.name!,
      subname: f.subname!,
      email: f.email!,
      password: f.password!,
    };

    const created = await this.userService.add(payload);
    if (created) {
      this.closeAdd();
      void this.loadSummary();
    }
  }

  viewUser(user: AdminUser): void {
    this.viewingUser.set(user);
  }

  closeView(): void {
    this.viewingUser.set(null);
  }

  async toggleBlock(user: AdminUser): Promise<void> {
    const action = user.status === 'active' ? 'bloquer' : 'débloquer';
    if (!confirm(`Voulez-vous vraiment ${action} ${this.fullName(user)} ?`)) return;

    const updated = await this.userService.toggleBlock(user.id);
    if (updated) void this.loadSummary();
  }

  async remove(user: AdminUser): Promise<void> {
    if (!confirm(`Supprimer définitivement ${this.fullName(user)} ? Cette action est irréversible.`)) {
      return;
    }

    const ok = await this.userService.delete(user.id);
    if (ok) void this.loadSummary();
  }

  // ─── Utilitaires ──────────────────────────────────
  fullName(user: AdminUser): string {
    return [user.name, user.subname].filter(Boolean).join(' ').trim() || user.email;
  }

  initial(user: AdminUser): string {
    return (user.name || user.email || '?').charAt(0).toUpperCase();
  }

  avatarColor(name: string): string {
    const colors = ['#05DF72', '#04C966', '#03A654', '#0284C7', '#7C3AED', '#D97706', '#DC2626', '#0F766E'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  roleLabel(role: UserRole): string {
    return role === 'ADMIN' ? 'Administrateur' : 'Marchand';
  }

  roleBadgeClass(role: UserRole): string {
    return role === 'ADMIN' ? 'bk-role--admin' : 'bk-role--user';
  }

  goToPage(page1Based: number): void {
    const total = this.totalPages();
    if (page1Based < 1 || page1Based > total) return;
    void this.fetchUsers(page1Based - 1);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    void this.fetchUsers(0);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('all');
    this.roleFilter.set('all');
    void this.fetchUsers(0);
  }

  exportCSV(): void {
    const rows = this.users();
    const header = ['ID', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Ville', 'Inscrit le', 'Dernière connexion'];
    const data = rows.map(u => [
      u.id,
      u.name,
      u.subname,
      u.email,
      u.phone ?? '',
      u.role,
      u.status,
      u.city,
      u.createdAt,
      u.lastLogin,
    ]);
    const csv = [header, ...data].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utilisateurs-bilanko-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
