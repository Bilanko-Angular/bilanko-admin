import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminUser, UserService, UserRole } from '../../services/user.service';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  private userService = inject(UserService);
  private searchService = inject(SearchService);
  private fb = inject(FormBuilder);

  // ─── Recherche & filtres ──────────────────────────
  get searchTerm() { return this.searchService.term; }
  statusFilter = signal<'all' | 'active' | 'blocked'>('all');
  roleFilter   = signal<'all' | UserRole>('all');

  private allUsers = this.userService.list();

  // ─── Statistiques en haut de page ─────────────────
  stats = computed(() => {
    const list = this.allUsers();
    const total = list.length;
    const active = list.filter(u => u.status === 'active').length;
    const blocked = list.filter(u => u.status === 'blocked').length;
    const newThisMonth = list.filter(u => {
      const [d, m, y] = u.createdAt.split('/').map(Number);
      const now = new Date();
      return m === now.getMonth() + 1 && y === now.getFullYear();
    }).length;
    return { total, active, blocked, newThisMonth };
  });

  // ─── Liste filtrée ────────────────────────────────
  filteredUsers = computed(() => {
    let users = this.allUsers();
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      users = users.filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.phone.includes(term) ||
        u.city.toLowerCase().includes(term)
      );
    }
    const status = this.statusFilter();
    if (status !== 'all') users = users.filter(u => u.status === status);

    const role = this.roleFilter();
    if (role !== 'all') users = users.filter(u => u.role === role);

    return users;
  });

  // ─── Pagination ───────────────────────────────────
  pageSize = 6;
  currentPage = signal(1);
  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize)));
  paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  // ─── Modales ──────────────────────────────────────
  editingUser = signal<AdminUser | null>(null);
  viewingUser = signal<AdminUser | null>(null);
  showAddModal = signal(false);

  editForm = this.fb.group({
    name:  ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    role:  ['USER' as UserRole, Validators.required],
    city:  [''],
  });

  addForm = this.fb.group({
    name:  ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    role:  ['USER' as UserRole, Validators.required],
    city:  [''],
    status: ['active' as 'active' | 'blocked', Validators.required],
  });

  // ─── Actions ──────────────────────────────────────
  openEdit(user: AdminUser) {
    this.editingUser.set(user);
    this.editForm.setValue({
      name: user.name, email: user.email, phone: user.phone,
      role: user.role, city: user.city,
    });
  }
  closeEdit() { this.editingUser.set(null); }

  saveEdit() {
    const user = this.editingUser();
    if (!user || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.userService.update(user.id, this.editForm.value as Partial<AdminUser>);
    this.closeEdit();
  }

  openAdd() {
    this.addForm.reset({ role: 'USER', status: 'active' });
    this.showAddModal.set(true);
  }
  closeAdd() { this.showAddModal.set(false); }

  saveAdd() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const f = this.addForm.value;
    const newUser: AdminUser = {
      id: Date.now(),
      name: f.name!,
      email: f.email!,
      phone: f.phone!,
      role: f.role as UserRole,
      status: f.status as 'active' | 'blocked',
      city: f.city || '—',
      createdAt: new Date().toLocaleDateString('fr-FR'),
      lastLogin: 'Jamais',
      productsCount: 0,
    };
    this.userService.add(newUser);
    this.closeAdd();
  }

  viewUser(user: AdminUser) { this.viewingUser.set(user); }
  closeView() { this.viewingUser.set(null); }

  toggleBlock(user: AdminUser) {
    const action = user.status === 'active' ? 'bloquer' : 'débloquer';
    if (confirm(`Voulez-vous vraiment ${action} ${user.name} ?`)) {
      this.userService.toggleBlock(user.id);
    }
  }

  remove(user: AdminUser) {
    if (confirm(`Supprimer définitivement ${user.name} ? Cette action est irréversible.`)) {
      this.userService.delete(user.id);
    }
  }

  // ─── Utilitaires ──────────────────────────────────
  initial(name: string) { return name.charAt(0).toUpperCase(); }

  avatarColor(name: string): string {
    // Couleur stable par utilisateur basée sur son nom
    const colors = ['#05DF72', '#04C966', '#03A654', '#0284C7', '#7C3AED', '#D97706', '#DC2626', '#0F766E'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  roleLabel(role: UserRole): string {
    return role === 'ADMIN' ? 'Administrateur' : role === 'MANAGER' ? 'Gestionnaire' : 'Utilisateur';
  }

  roleBadgeClass(role: UserRole): string {
    return role === 'ADMIN' ? 'bk-role--admin' : role === 'MANAGER' ? 'bk-role--manager' : 'bk-role--user';
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  clearSearch() { this.searchService.term.set(''); }

  clearFilters() {
    this.searchService.term.set('');
    this.statusFilter.set('all');
    this.roleFilter.set('all');
    this.currentPage.set(1);
  }

  exportCSV() {
    const rows = this.filteredUsers();
    const header = ['ID', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Ville', 'Inscrit le', 'Dernière connexion'];
    const data = rows.map(u => [
      u.id, u.name, u.email, u.phone, u.role, u.status, u.city, u.createdAt, u.lastLogin,
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