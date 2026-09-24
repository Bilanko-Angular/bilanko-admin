import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { AdminSale, SaleService } from '../../services/sale.service';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './sales.html',
  styleUrl: './sales.css',
})
export class Sales {
  private saleService = inject(SaleService);
  private searchService = inject(SearchService);
  private fb = inject(FormBuilder);

  get searchTerm() { return this.searchService.term; }

  statusFilter = signal<'all' | 'paid' | 'pending'>('all');
  periodFilter = signal<'all' | 'today' | 'week' | 'month'>('all');

  private allSales = this.saleService.list();

  // Stats
  stats = computed(() => {
    const list = this.allSales();
    const revenue = list.reduce((s, v) => s + v.totalAmount, 0);
    const margin = list.reduce((s, v) => s + v.totalMargin, 0);
    const now = new Date();
    const thisMonth = list.filter(v => {
      const d = new Date(v.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthRevenue = thisMonth.reduce((s, v) => s + v.totalAmount, 0);
    const avg = list.length ? revenue / list.length : 0;
    return { revenue, margin, monthRevenue, avg, count: list.length };
  });

  // Liste filtrée
  filteredSales = computed(() => {
    let list = this.allSales();
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      list = list.filter(s =>
        s.client.toLowerCase().includes(term) ||
        s.userName.toLowerCase().includes(term)
      );
    }
    const status = this.statusFilter();
    if (status !== 'all') list = list.filter(s => s.status === status);

    const period = this.periodFilter();
    if (period !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      list = list.filter(s => {
        const d = new Date(s.date);
        if (period === 'today') return d >= today;
        if (period === 'week') {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          return d >= weekStart;
        }
        if (period === 'month') {
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }
    return list;
  });

  filteredTotal = computed(() =>
    this.filteredSales().reduce((s, v) => s + v.totalAmount, 0)
  );

  // Pagination
  pageSize = 8;
  currentPage = signal(1);
  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredSales().length / this.pageSize)));
  paginatedSales = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredSales().slice(start, start + this.pageSize);
  });

  // Modales
  viewingSale = signal<AdminSale | null>(null);
  editingSale = signal<AdminSale | null>(null);
  confirmDeleteId = signal<number | null>(null);
  showAddModal = signal(false);

  editForm = this.fb.group({
    client: ['', Validators.required],
    date: ['', Validators.required],
    status: ['paid' as 'paid' | 'pending', Validators.required],
  });

  addForm = this.fb.group({
    client: ['', Validators.required],
    date: [new Date().toISOString().slice(0, 16), Validators.required],
    totalAmount: [0, [Validators.required, Validators.min(1)]],
    totalMargin: [0, Validators.min(0)],
    itemsCount: [1, [Validators.required, Validators.min(1)]],
    status: ['paid' as 'paid' | 'pending', Validators.required],
  });

  // Actions
  openEdit(s: AdminSale) {
    this.editingSale.set(s);
    this.editForm.setValue({
      client: s.client,
      date: s.date.slice(0, 16),
      status: s.status,
    });
  }
  closeEdit() { this.editingSale.set(null); }

  saveEdit() {
    const s = this.editingSale();
    if (!s || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.saleService.update(s.id, this.editForm.value as Partial<AdminSale>);
    this.closeEdit();
  }

  // Nouvelle vente
  openAdd() {
    this.addForm.reset({
      client: '',
      date: new Date().toISOString().slice(0, 16),
      totalAmount: 0,
      totalMargin: 0,
      itemsCount: 1,
      status: 'paid',
    });
    this.showAddModal.set(true);
  }
  closeAdd() { this.showAddModal.set(false); }

  saveAdd() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const f = this.addForm.value;
    const newSale: AdminSale = {
      id: Date.now(),
      date: f.date!,
      client: f.client!,
      totalAmount: Number(f.totalAmount),
      totalMargin: Number(f.totalMargin),
      itemsCount: Number(f.itemsCount),
      status: f.status as 'paid' | 'pending',
      userId: 1,
      userName: 'Admin',
      items: [],
    };
    this.saleService.add(newSale);
    this.closeAdd();
  }

  viewSale(s: AdminSale) { this.viewingSale.set(s); }
  closeView() { this.viewingSale.set(null); }

  askDelete(s: AdminSale) { this.confirmDeleteId.set(s.id); }
  cancelDelete() { this.confirmDeleteId.set(null); }
  confirmDelete() {
    const id = this.confirmDeleteId();
    if (id) this.saleService.delete(id);
    this.confirmDeleteId.set(null);
  }

  // Utilitaires
  statusLabel(s: 'paid' | 'pending') { return s === 'paid' ? 'Payée' : 'En attente'; }
  statusClass(s: 'paid' | 'pending') {
    return s === 'paid' ? 'bk-status--paid' : 'bk-status--pending';
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages()) this.currentPage.set(p);
  }
  clearSearch() { this.searchService.term.set(''); }
  clearFilters() {
    this.searchService.term.set('');
    this.statusFilter.set('all');
    this.periodFilter.set('all');
    this.currentPage.set(1);
  }

  exportCSV() {
    const rows = this.filteredSales();
    const header = ['Date', 'Client', 'Articles', 'Montant (FCFA)', 'Marge (FCFA)', 'Statut', 'Utilisateur'];
    const data = rows.map(s => [
      new Date(s.date).toLocaleString('fr-FR'),
      s.client, s.itemsCount, s.totalAmount, s.totalMargin,
      s.status === 'paid' ? 'Payée' : 'En attente', s.userName,
    ]);
    const csv = [header, ...data].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventes-bilanko-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}