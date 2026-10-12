import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { CategoryStoreService } from '../../service/store/category/category-store.service';
import { SearchService } from '../../service/app/search/search.service';
import { AdminCategory } from '../../models/category/admin-category';
import { CategoryType } from '../../models/DTO/category/CategoryDTOs';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, DecimalPipe],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  public categoryService = inject(CategoryStoreService);
  private searchService = inject(SearchService);
  private fb = inject(FormBuilder);

  CategoryType = CategoryType; // Expose enum to template

  get searchTerm() { return this.searchService.term; }

  ngOnInit() {
    this.categoryService.summary();
    this.loadData();
  }

  loadData() {
    if (this.searchTerm().trim()) {
      this.categoryService.search({ name: this.searchTerm().trim(), page: this.categoryService.actualIndex() });
    } else {
      this.categoryService.loadPage(undefined, this.categoryService.actualIndex());
    }
  }

  onSearchChange(term: string) {
    this.searchService.term.set(term);
    this.categoryService.search({ name: term, page: 0 });
  }

  // Modales
  editingCategory = signal<AdminCategory | null>(null);
  viewingCategory = signal<AdminCategory | null>(null);
  showAddModal = signal(false);
  confirmDeleteId = signal<number | null>(null);

  // Formulaires
  editForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    categoryType: [CategoryType.PRODUCT, Validators.required]
  });

  addForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    categoryType: [CategoryType.PRODUCT, Validators.required]
  });

  // ─── Actions ──────────────────────────────────────
  openEdit(c: AdminCategory) {
    this.editingCategory.set(c);
    this.editForm.setValue({ name: c.name, categoryType: c.categoryType });
  }
  closeEdit() { this.editingCategory.set(null); }

  saveEdit() {
    const c = this.editingCategory();
    if (!c || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.categoryService.updateCategory(c.id, {
      id: c.id,
      name: this.editForm.value.name!.trim(),
      categoryType: this.editForm.value.categoryType as CategoryType
    });
    this.closeEdit();
  }

  openAdd() {
    this.addForm.reset({ name: '', categoryType: CategoryType.PRODUCT });
    this.showAddModal.set(true);
  }
  closeAdd() { this.showAddModal.set(false); }

  saveAdd() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    this.categoryService.add({
      id: 0,
      name: this.addForm.value.name!.trim(),
      categoryType: this.addForm.value.categoryType as CategoryType
    });
    this.closeAdd();
  }

  viewCategory(c: AdminCategory) { this.viewingCategory.set(c); }
  closeView() { this.viewingCategory.set(null); }

  askDelete(c: AdminCategory) { this.confirmDeleteId.set(c.id); }
  cancelDelete() { this.confirmDeleteId.set(null); }
  confirmDelete() {
    const id = this.confirmDeleteId();
    if (id) {
       this.categoryService.deleteCategory({ id, name: '', categoryType: CategoryType.PRODUCT }); // name and categoryType not used for delete by id, but DTO requires them.
    }
    this.confirmDeleteId.set(null);
  }

  // ─── Utilitaires ─────────────────────────────────
  goToPage(p: number) {
    // API is 0-indexed, UI is 1-indexed for page buttons
    const apiPage = p - 1;
    if (apiPage >= 0 && apiPage < this.categoryService.totalPage()) {
      if (this.searchTerm().trim()) {
        this.categoryService.search({ name: this.searchTerm().trim(), page: apiPage });
      } else {
        this.categoryService.loadPage(undefined, apiPage);
      }
    }
  }

  clearSearch() {
    this.searchService.term.set('');
    this.loadData();
  }

  clearFilters() {
    this.searchService.term.set('');
    this.categoryService.loadPage(undefined, 0);
  }

  exportCSV() {
    const rows = this.categoryService.categories();
    const header = ['ID', 'Nom', 'Type', 'Nombre d\'elements', 'Nombre d\'utilisateurs'];
    const data = rows.map(c => [c.id, c.name, c.categoryType, c.elementsCount, c.usersCount]);
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
