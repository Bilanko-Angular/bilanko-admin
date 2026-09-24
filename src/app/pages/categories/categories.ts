import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { AdminCategory, CategoryService } from '../../services/category.service';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, DatePipe, DecimalPipe],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories {
  private categoryService = inject(CategoryService);
  private searchService = inject(SearchService);
  private fb = inject(FormBuilder);

  get searchTerm() { return this.searchService.term; }

  // Tri par défaut
  sortBy = signal<'name' | 'createdAt' | 'productsCount' | 'usersCount'>('name');
  sortDir = signal<'asc' | 'desc'>('asc');

  private allCategories = this.categoryService.list();

  // Stats globales
  stats = computed(() => {
    const list = this.allCategories();
    const totalProducts = list.reduce((s, c) => s + c.productsCount, 0);
    const totalUsers = list.reduce((s, c) => s + c.usersCount, 0);
    const avgProducts = list.length ? Math.round(totalProducts / list.length) : 0;
    return {
      total: list.length,
      totalProducts,
      totalUsers,
      avgProducts,
    };
  });

  // Liste filtrée + triée
  filteredCategories = computed(() => {
    let list = [...this.allCategories()];

    // Recherche
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      list = list.filter(c => c.name.toLowerCase().includes(term));
    }

    // Tri
    const sortBy = this.sortBy();
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name) * dir;
        case 'createdAt':
          return a.createdAt.localeCompare(b.createdAt) * dir;
        case 'productsCount':
          return (a.productsCount - b.productsCount) * dir;
        case 'usersCount':
          return (a.usersCount - b.usersCount) * dir;
        default:
          return 0;
      }
    });

    return list;
  });

  // Pagination
  pageSize = 8;
  currentPage = signal(1);
  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredCategories().length / this.pageSize))
  );
  paginatedCategories = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredCategories().slice(start, start + this.pageSize);
  });

  // Modales
  editingCategory = signal<AdminCategory | null>(null);
  viewingCategory = signal<AdminCategory | null>(null);
  showAddModal = signal(false);
  confirmDeleteId = signal<number | null>(null);

  // Formulaires
  editForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  addForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  // ─── Actions ──────────────────────────────────────
  openEdit(c: AdminCategory) {
    this.editingCategory.set(c);
    this.editForm.setValue({ name: c.name });
  }
  closeEdit() { this.editingCategory.set(null); }

  saveEdit() {
    const c = this.editingCategory();
    if (!c || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    // ✅ On modifie uniquement le nom
    this.categoryService.update(c.id, { name: this.editForm.value.name!.trim() });
    this.closeEdit();
  }

  openAdd() {
    this.addForm.reset({ name: '' });
    this.showAddModal.set(true);
  }
  closeAdd() { this.showAddModal.set(false); }

  saveAdd() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const newCategory: AdminCategory = {
      id: Date.now(),
      name: this.addForm.value.name!.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
      productsCount: 0,
      usersCount: 0,
    };
    this.categoryService.add(newCategory);
    this.closeAdd();
  }

  viewCategory(c: AdminCategory) { this.viewingCategory.set(c); }
  closeView() { this.viewingCategory.set(null); }

  askDelete(c: AdminCategory) { this.confirmDeleteId.set(c.id); }
  cancelDelete() { this.confirmDeleteId.set(null); }
  confirmDelete() {
    const id = this.confirmDeleteId();
    if (id) this.categoryService.delete(id);
    this.confirmDeleteId.set(null);
  }

  // ─── Tri ─────────────────────────────────────────
  changeSort(field: 'name' | 'createdAt' | 'productsCount' | 'usersCount') {
    if (this.sortBy() === field) {
      this.sortDir.update(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortBy.set(field);
      this.sortDir.set('asc');
    }
    this.currentPage.set(1);
  }

  sortIcon(field: string): string {
    if (this.sortBy() !== field) return 'unfold_more';
    return this.sortDir() === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  // ─── Utilitaires ─────────────────────────────────
  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages()) this.currentPage.set(p);
  }

  clearSearch() { this.searchService.term.set(''); }

  clearFilters() {
    this.searchService.term.set('');
    this.sortBy.set('name');
    this.sortDir.set('asc');
    this.currentPage.set(1);
  }

  exportCSV() {
    const rows = this.filteredCategories();
    const header = ['ID', 'Nom', 'Date de création', 'Nombre de produits', 'Nombre d\'utilisateurs'];
    const data = rows.map(c => [c.id, c.name, c.createdAt, c.productsCount, c.usersCount]);
    const csv = [header, ...data].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categories-bilanko-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}