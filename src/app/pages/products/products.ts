import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ProductStoreService } from '../../service/store/product/product-store.service';
import { UserStoreService } from '../../service/store/user/user-store.service';
import { SearchService } from '../../service/app/search/search.service';
import { AdminProduct } from '../../models/product/adminProduct';
import { AdminProductSummaryDTO } from '../../models/DTO/product/AdminProductSummaryDTO';
import { AdminProductCreateRequest } from '../../models/DTO/product/AdminProductCreateRequest';
import { AdminProductUpdateRequest } from '../../models/DTO/product/AdminProductUpdateRequest';
import { CategoryStoreService } from '../../service/store/category/category-store.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, DatePipe, DecimalPipe],
  templateUrl: './products.html',
  styleUrls: ['./products.css'],
})
export class Products implements OnInit {
  private readonly productService  = inject(ProductStoreService);
  private readonly userStore       = inject(UserStoreService);
  private readonly searchService   = inject(SearchService);
  private readonly fb              = inject(FormBuilder);
  private readonly destroyRef      = inject(DestroyRef);
  private readonly categoryService = inject(CategoryStoreService);

  private readonly searchTrigger = new Subject<string>();
  private readonly pageSize      = 10;

  // ─── Store (lecture) ──────────────────────────────
  readonly products         = this.productService.products;
  readonly isLoading        = this.productService.isLoading;
  readonly error            = this.productService.error;
  readonly totalPages       = this.productService.totalPage;
  readonly totalProducts    = this.productService.totalProduct;
  readonly currentPageIndex = this.productService.actualIndex;
  readonly categories       = this.categoryService.charges;

  // ─── Recherche & filtres ──────────────────────────
  get searchTerm() { return this.searchService.term; }
  categoryFilter = signal<'all' | number>('all');

  // ─── Statistiques ─────────────────────────────────
  stats = signal<AdminProductSummaryDTO>({
    totalCount:             0,
    addedThisMonthCount:    0,
    associatedWithSaleCount: 0,
    averagePrice:           0,
  });
  statsLoading = signal(true);

  // ─── Skeletons ────────────────────────────────────
  readonly skeletonRows = Array.from({ length: 6 }, (_, i) => i);

  // ─── Modales ──────────────────────────────────────
  editingProduct = signal<AdminProduct | null>(null);
  viewingProduct = signal<AdminProduct | null>(null);
  showAddModal   = signal(false);

  editForm = this.fb.group({
    name:           ['', Validators.required],
    quantity:       [0, [Validators.required, Validators.min(0)]],
    price:          [0, [Validators.required, Validators.min(0)]],
    purchasePrice:  [0, [Validators.required, Validators.min(0)]],
    alertThreshold: [null as number | null],
  });

  addForm = this.fb.group({
    name:           ['', Validators.required],
    quantity:       [0, [Validators.required, Validators.min(0)]],
    price:          [0, [Validators.required, Validators.min(0)]],
    purchasePrice:  [0, [Validators.required, Validators.min(0)]],
    alertThreshold: [null as number | null],
  });

  ngOnInit(): void {
    this.searchTrigger
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => void this.fetchProducts(0));

    void this.loadSummary();
    void this.fetchProducts();
  }

  // ─── Chargement ───────────────────────────────────
  private async loadSummary(): Promise<void> {
    this.statsLoading.set(true);
    const summary = await this.productService.summary();
    this.stats.set(summary);
    this.statsLoading.set(false);
  }

  private async fetchProducts(page = 0): Promise<void> {
    const keyword    = this.searchTerm().trim() || undefined;
    const categoryId = this.categoryFilter() === 'all' ? undefined : this.categoryFilter() as number;

    const hasFilters = !!keyword || categoryId !== undefined;

    if (hasFilters) {
      await this.productService.search({ keyword, categoryId, page, size: this.pageSize });
    } else {
      await this.productService.loadPage(page, this.pageSize);
    }
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.searchTrigger.next(value.trim());
  }

  onCategoryFilterChange(value: 'all' | number | string): void {
    this.categoryFilter.set(value === 'all' ? 'all' : Number(value));
    void this.fetchProducts(0);
  }

  // ─── Actions ──────────────────────────────────────
  openEdit(p: AdminProduct): void {
    this.editingProduct.set(p);
    this.editForm.setValue({
      name:           p.name,
      quantity:       p.quantity,
      price:          p.price,
      purchasePrice:  p.purchasePrice,
      alertThreshold: p.alertThreshold,
    });
  }

  closeEdit(): void { this.editingProduct.set(null); }

  async saveEdit(): Promise<void> {
    const p = this.editingProduct();
    if (!p || this.editForm.invalid) { this.editForm.markAllAsTouched(); return; }

    const f = this.editForm.getRawValue();
    const payload: AdminProductUpdateRequest = {
      name:           f.name!,
      quantity:       Number(f.quantity),
      price:          Number(f.price),
      purchasePrice:  Number(f.purchasePrice),
      alertThreshold: f.alertThreshold ?? null,
    };

    const updated = await this.productService.update(p.id, payload);
    if (updated) { this.closeEdit(); void this.loadSummary(); }
  }

  openAdd(): void {
    this.addForm.reset({ name: '', quantity: 0, price: 0, purchasePrice: 0, alertThreshold: null });
    this.showAddModal.set(true);
  }

  closeAdd(): void { this.showAddModal.set(false); }

  async saveAdd(): Promise<void> {
    if (this.addForm.invalid) { this.addForm.markAllAsTouched(); return; }

    const userId = this.userStore.user()?.id;
    if (!userId) { alert('Utilisateur non connecté.'); return; }

    const f = this.addForm.getRawValue();
    const payload: AdminProductCreateRequest = {
      userId,
      name:           f.name!,
      quantity:       Number(f.quantity),
      price:          Number(f.price),
      purchasePrice:  Number(f.purchasePrice),
      alertThreshold: f.alertThreshold ?? null,
    };

    const created = await this.productService.add(payload);
    if (created) { this.closeAdd(); void this.loadSummary(); }
  }

  viewProduct(p: AdminProduct): void  { this.viewingProduct.set(p); }
  closeView(): void                   { this.viewingProduct.set(null); }

  async remove(p: AdminProduct): Promise<void> {
    if (!confirm(`Supprimer le produit "${p.name}" ?`)) return;
    const ok = await this.productService.delete(p.id);
    if (ok) void this.loadSummary();
  }

  // ─── Utilitaires ──────────────────────────────────
  fullUserName(p: AdminProduct): string {
    return [p.userName, p.userSubname].filter(Boolean).join(' ').trim() || '—';
  }

  categoryLabel(p: AdminProduct): string {
    return p.categories.length ? p.categories.map(c => c.name).join(', ') : 'Sans catégorie';
  }

  categoryClass(name: string): string {
    const palette = ['bk-cat--blue', 'bk-cat--orange', 'bk-cat--purple', 'bk-cat--green', 'bk-cat--gray', 'bk-cat--red'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
  }

  stockClass(p: AdminProduct): string {
    if (p.alertThreshold !== null && p.quantity <= p.alertThreshold) return 'bk-qty--danger';
    if (p.quantity < 10) return 'bk-qty--warn';
    return 'bk-qty--ok';
  }

  goToPage(page1Based: number): void {
    const total = this.totalPages();
    if (page1Based < 1 || page1Based > total) return;
    void this.fetchProducts(page1Based - 1);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    void this.fetchProducts(0);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.categoryFilter.set('all');
    void this.fetchProducts(0);
  }

  exportCSV(): void {
    const rows = this.products();
    const header = ['Date ajout', 'Nom', 'Catégorie', 'Prix achat (FCFA)', 'Prix vente (FCFA)', 'Qté', 'Utilisateur'];
    const data = rows.map(p => [
      p.createdAt,
      p.name,
      this.categoryLabel(p),
      p.purchasePrice,
      p.price,
      p.quantity,
      this.fullUserName(p),
    ]);
    const csv = [header, ...data].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `produits-bilanko-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}