import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ChargeStoreService } from '../../service/store/charges/charge-store.service';
import { UserStoreService } from '../../service/store/user/user-store.service';
import { SearchService } from '../../services/search.service';
import { AdminCharge } from '../../models/charge/adminCharge';
import { AdminChargeSummaryDTO } from '../../models/DTO/charge/AdminChargeSummaryDTO';
import { AdminChargeCreateRequest } from '../../models/DTO/charge/AdminChargeCreateRequest';
import { AdminChargeUpdateRequest } from '../../models/DTO/charge/AdminChargeUpdateRequest';

type PeriodFilter = 'all' | 'today' | 'week' | 'month';

@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, DatePipe, DecimalPipe],
  templateUrl: './charges.html',
  styleUrl: './charges.css',
})
export class Charges implements OnInit {
  private readonly chargeService = inject(ChargeStoreService);
  private readonly userStore = inject(UserStoreService);
  private readonly searchService = inject(SearchService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  private readonly searchTrigger = new Subject<string>();
  private readonly pageSize = 10;

  // ─── Store (lecture) ──────────────────────────────
  readonly charges = this.chargeService.charges;
  readonly isLoading = this.chargeService.isLoading;
  readonly error = this.chargeService.error;
  readonly totalPages = this.chargeService.totalPage;
  readonly totalCharges = this.chargeService.totalCharge;
  readonly currentPageIndex = this.chargeService.actualIndex;

  // ─── Recherche & filtres ──────────────────────────
  get searchTerm() { return this.searchService.term; }
  categoryFilter = signal<'all' | number>('all');
  periodFilter = signal<PeriodFilter>('all');

  // ─── Statistiques ─────────────────────────────────
  stats = signal<AdminChargeSummaryDTO>({
    totalCount: 0,
    totalSum: 0,
    currentMonthSum: 0,
    averagePrice: 0,
  });
  statsLoading = signal(true);

  // ─── Skeletons ────────────────────────────────────
  readonly skeletonRows = Array.from({ length: 6 }, (_, i) => i);

  // ─── Modales ──────────────────────────────────────
  editingCharge = signal<AdminCharge | null>(null);
  viewingCharge = signal<AdminCharge | null>(null);
  showAddModal = signal(false);

  editForm = this.fb.group({
    label: ['', Validators.required],
    supplier: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    date: ['', Validators.required],
    categoryId: [null as number | null],
  });

  addForm = this.fb.group({
    label: ['', Validators.required],
    supplier: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    date: [new Date().toISOString().slice(0, 10), Validators.required],
    categoryId: [null as number | null],
  });

  ngOnInit(): void {
    this.searchTrigger
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => void this.fetchCharges(0));

    void this.loadSummary();
    void this.fetchCharges();
  }

  // ─── Chargement ───────────────────────────────────
  private async loadSummary(): Promise<void> {
    this.statsLoading.set(true);
    const summary = await this.chargeService.summary();
    this.stats.set(summary);
    this.statsLoading.set(false);
  }

  private async fetchCharges(page = 0): Promise<void> {
    const keyword = this.searchTerm().trim() || undefined;
    const categoryId = this.categoryFilter() === 'all' ? undefined : this.categoryFilter() as number;
    const { startDate, endDate } = this.resolvePeriodRange(this.periodFilter());

    const hasFilters = !!keyword || categoryId !== undefined || !!startDate || !!endDate;

    if (hasFilters) {
      await this.chargeService.search({
        keyword,
        categoryId,
        startDate,
        endDate,
        page,
        size: this.pageSize,
      });
    } else {
      await this.chargeService.loadPage(page, this.pageSize);
    }
  }

  private resolvePeriodRange(period: PeriodFilter): { startDate?: string; endDate?: string } {
    if (period === 'all') return {};

    const now = new Date();
    const endDate = this.toIsoDate(now);

    if (period === 'today') {
      return { startDate: endDate, endDate };
    }

    if (period === 'week') {
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      return { startDate: this.toIsoDate(weekStart), endDate };
    }

    // month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: this.toIsoDate(monthStart), endDate };
  }

  private toIsoDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.searchTrigger.next(value.trim());
  }

  onCategoryFilterChange(value: 'all' | number | string): void {
    this.categoryFilter.set(value === 'all' ? 'all' : Number(value));
    void this.fetchCharges(0);
  }

  onPeriodFilterChange(value: PeriodFilter): void {
    this.periodFilter.set(value);
    void this.fetchCharges(0);
  }

  // ─── Actions ──────────────────────────────────────
  openEdit(c: AdminCharge): void {
    this.editingCharge.set(c);
    this.editForm.setValue({
      label: c.label,
      supplier: c.supplier,
      amount: c.amount,
      date: c.date,
      categoryId: c.categoryId,
    });
  }

  closeEdit(): void {
    this.editingCharge.set(null);
  }

  async saveEdit(): Promise<void> {
    const c = this.editingCharge();
    if (!c || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const f = this.editForm.getRawValue();
    const payload: AdminChargeUpdateRequest = {
      label: f.label!,
      supplier: f.supplier!,
      amount: Number(f.amount),
      date: f.date!,
      categoryId: f.categoryId ?? null,
    };

    const updated = await this.chargeService.update(c.id, payload);
    if (updated) {
      this.closeEdit();
      void this.loadSummary();
    }
  }

  openAdd(): void {
    this.addForm.reset({
      label: '',
      supplier: '',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      categoryId: null,
    });
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

    const userId = this.userStore.user()?.id;
    if (!userId) {
      alert('Impossible de créer la charge : utilisateur non connecté.');
      return;
    }

    const f = this.addForm.getRawValue();
    const payload: AdminChargeCreateRequest = {
      label: f.label!,
      supplier: f.supplier!,
      amount: Number(f.amount),
      date: f.date!,
      categoryId: f.categoryId ?? null,
      userId,
    };

    const created = await this.chargeService.add(payload);
    if (created) {
      this.closeAdd();
      void this.loadSummary();
    }
  }

  viewCharge(c: AdminCharge): void {
    this.viewingCharge.set(c);
  }

  closeView(): void {
    this.viewingCharge.set(null);
  }

  async remove(c: AdminCharge): Promise<void> {
    if (!confirm(`Supprimer la charge "${c.label}" ?`)) return;

    const ok = await this.chargeService.delete(c.id);
    if (ok) void this.loadSummary();
  }

  // ─── Utilitaires ──────────────────────────────────
  fullUserName(c: AdminCharge): string {
    return [c.userName, c.userSubname].filter(Boolean).join(' ').trim() || '—';
  }

  categoryClass(categoryName: string): string {
    const palette = [
      'bk-cat--blue',
      'bk-cat--orange',
      'bk-cat--purple',
      'bk-cat--green',
      'bk-cat--gray',
      'bk-cat--red',
    ];
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return palette[Math.abs(hash) % palette.length];
  }

  goToPage(page1Based: number): void {
    const total = this.totalPages();
    if (page1Based < 1 || page1Based > total) return;
    void this.fetchCharges(page1Based - 1);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    void this.fetchCharges(0);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.categoryFilter.set('all');
    this.periodFilter.set('all');
    void this.fetchCharges(0);
  }

  exportCSV(): void {
    const rows = this.charges();
    const header = ['Date', 'Libellé', 'Fournisseur', 'Catégorie', 'Utilisateur', 'Montant (FCFA)'];
    const data = rows.map(c => [
      c.date,
      c.label,
      c.supplier,
      c.categoryName,
      this.fullUserName(c),
      c.amount,
    ]);
    const csv = [header, ...data].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `charges-bilanko-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
