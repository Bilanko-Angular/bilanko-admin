import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { AdminCharge, ChargeService, ChargeCategory } from '../../services/charge.service';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, DatePipe, DecimalPipe],
  templateUrl: './charges.html',
  styleUrl: './charges.css',
})
export class Charges {
  private chargeService = inject(ChargeService);
  private searchService = inject(SearchService);
  private fb = inject(FormBuilder);

  get searchTerm() { return this.searchService.term; }

  categoryFilter = signal<'all' | ChargeCategory>('all');
  periodFilter = signal<'all' | 'today' | 'week' | 'month'>('all');

  private allCharges = this.chargeService.list();

  // Stats
  stats = computed(() => {
    const list = this.allCharges();
    const total = list.reduce((s, c) => s + c.amount, 0);
    const now = new Date();
    const thisMonth = list.filter(c => {
      const d = new Date(c.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthTotal = thisMonth.reduce((s, c) => s + c.amount, 0);
    const avg = list.length ? total / list.length : 0;
    return { total, monthTotal, avg, count: list.length };
  });

  // Catégories disponibles
  categories = computed(() => {
    const set = new Set<ChargeCategory>();
    this.allCharges().forEach(c => set.add(c.category));
    return Array.from(set).sort();
  });

  // Liste filtrée
  filteredCharges = computed(() => {
    let list = this.allCharges();
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      list = list.filter(c =>
        c.label.toLowerCase().includes(term) ||
        c.supplier.toLowerCase().includes(term) ||
        c.userName.toLowerCase().includes(term)
      );
    }
    const cat = this.categoryFilter();
    if (cat !== 'all') list = list.filter(c => c.category === cat);

    const period = this.periodFilter();
    if (period !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      list = list.filter(c => {
        const d = new Date(c.date);
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

  // Total filtré
  filteredTotal = computed(() =>
    this.filteredCharges().reduce((s, c) => s + c.amount, 0)
  );

  // Pagination
  pageSize = 8;
  currentPage = signal(1);
  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredCharges().length / this.pageSize)));
  paginatedCharges = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredCharges().slice(start, start + this.pageSize);
  });

  // Modales
  editingCharge = signal<AdminCharge | null>(null);
  viewingCharge = signal<AdminCharge | null>(null);
  showAddModal = signal(false);

  editForm = this.fb.group({
    label: ['', Validators.required],
    supplier: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    date: ['', Validators.required],
    category: ['Transport' as ChargeCategory, Validators.required],
    notes: [''],
  });

  addForm = this.fb.group({
    label: ['', Validators.required],
    supplier: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    date: [new Date().toISOString().slice(0, 10), Validators.required],
    category: ['Transport' as ChargeCategory, Validators.required],
    notes: [''],
  });

  // Actions
  openEdit(c: AdminCharge) {
    this.editingCharge.set(c);
    this.editForm.setValue({
      label: c.label, supplier: c.supplier, amount: c.amount,
      date: c.date, category: c.category, notes: c.notes || '',
    });
  }
  closeEdit() { this.editingCharge.set(null); }

  saveEdit() {
    const c = this.editingCharge();
    if (!c || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.chargeService.update(c.id, this.editForm.value as Partial<AdminCharge>);
    this.closeEdit();
  }

  openAdd() {
    this.addForm.reset({
      label: '', supplier: '', amount: 0,
      date: new Date().toISOString().slice(0, 10),
      category: 'Transport', notes: '',
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
    const newCharge: AdminCharge = {
      id: Date.now(),
      label: f.label!,
      supplier: f.supplier!,
      amount: Number(f.amount),
      date: f.date!,
      category: f.category as ChargeCategory,
      notes: f.notes || '',
      userId: 1,
      userName: 'Admin',
    };
    this.chargeService.add(newCharge);
    this.closeAdd();
  }

  viewCharge(c: AdminCharge) { this.viewingCharge.set(c); }
  closeView() { this.viewingCharge.set(null); }

  remove(c: AdminCharge) {
    if (confirm(`Supprimer la charge "${c.label}" ?`)) {
      this.chargeService.delete(c.id);
    }
  }

  // Utilitaires
  categoryClass(cat: ChargeCategory): string {
    const map: Record<ChargeCategory, string> = {
      'Transport': 'bk-cat--blue',
      'Énergie': 'bk-cat--orange',
      'Fournitures': 'bk-cat--purple',
      'Communication': 'bk-cat--green',
      'Entretien': 'bk-cat--gray',
      'Loyer': 'bk-cat--red',
      'Autre': 'bk-cat--gray',
    };
    return map[cat] || 'bk-cat--gray';
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages()) this.currentPage.set(p);
  }

  clearSearch() { this.searchService.term.set(''); }

  clearFilters() {
    this.searchService.term.set('');
    this.categoryFilter.set('all');
    this.periodFilter.set('all');
    this.currentPage.set(1);
  }

  exportCSV() {
    const rows = this.filteredCharges();
    const header = ['Date', 'Libellé', 'Fournisseur', 'Catégorie', 'Utilisateur', 'Montant (FCFA)'];
    const data = rows.map(c => [c.date, c.label, c.supplier, c.category, c.userName, c.amount]);
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