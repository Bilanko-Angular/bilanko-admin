import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { SaleStoreService } from '../../service/store/vente/sale-store.service';
import { SearchService } from '../../service/app/search/search.service';
import { AdminSale } from '../../models/sale/admin-sale';
import { SaleItemRequestDTO } from '../../models/DTO/sale/SaleDTOs';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, DatePipe, DecimalPipe],
  templateUrl: './sales.html',
  styleUrl: './sales.css',
})
export class Sales implements OnInit {
  public saleService = inject(SaleStoreService);
  private searchService = inject(SearchService);
  private fb = inject(FormBuilder);

  get searchTerm() { return this.searchService.term; }

  ngOnInit() {
    this.saleService.summary();
    this.loadData();
  }

  loadData() {
    if (this.searchTerm().trim()) {
      this.saleService.search({ keyword: this.searchTerm().trim(), page: this.saleService.actualIndex() });
    } else {
      this.saleService.loadPage(this.saleService.actualIndex());
    }
  }

  onSearchChange(term: string) {
    this.searchService.term.set(term);
    this.saleService.search({ keyword: term, page: 0 });
  }

  // Modales
  viewingSale = signal<AdminSale | null>(null);
  editingSale = signal<AdminSale | null>(null);
  confirmDeleteId = signal<number | null>(null);
  showAddModal = signal(false);

  editForm = this.fb.group({
    client: ['', Validators.required],
    date: ['', Validators.required]
  });

  addForm = this.fb.group({
    client: ['', Validators.required],
    date: [new Date().toISOString().slice(0, 16), Validators.required]
  });

  // Actions
  openEdit(s: AdminSale) {
    this.editingSale.set(s);
    this.editForm.setValue({
      client: s.customerName,
      date: s.saleDate ? s.saleDate.slice(0, 16) : new Date().toISOString().slice(0, 16),
    });
  }
  closeEdit() { this.editingSale.set(null); }

  saveEdit() {
    const s = this.editingSale();
    if (!s || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    // Le formulaire d'édition actuel ne permet pas de modifier les articles
    // Pour l'API, il faut envoyer les items (SaleItemRequestDTO). On enverra un tableau vide pour l'instant
    // TODO: Implémenter la gestion des articles dans le formulaire de modification

    this.saleService.update(s.id, {
      customerName: this.editForm.value.client!,
      saleDate: this.editForm.value.date ? new Date(this.editForm.value.date).toISOString() : undefined,
      items: [] // Manquant: interface pour modifier les articles
    });
    this.closeEdit();
  }

  // Nouvelle vente
  openAdd() {
    this.addForm.reset({
      client: '',
      date: new Date().toISOString().slice(0, 16)
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

    // Le formulaire de création actuel manque d'une section pour ajouter des articles (produits, quantité, prix).
    // On envoie un article factice pour que l'API ne rejette pas la requête
    // TODO: Créer un composant pour gérer la liste des articles

    const items: SaleItemRequestDTO[] = [{
       productId: 1, // ID factice
       quantity: 1,
       unitPrice: 0
    }];

    this.saleService.add({
      userId: 1, // ID factice - l'interface utilisateur pour la sélection d'utilisateur n'est pas encore faite
      customerName: f.client!,
      saleDate: f.date ? new Date(f.date).toISOString() : undefined,
      items: items
    });
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

  goToPage(p: number) {
    const apiPage = p - 1;
    if (apiPage >= 0 && apiPage < this.saleService.totalPage()) {
      if (this.searchTerm().trim()) {
        this.saleService.search({keyword: this.searchTerm().trim(), page: apiPage})
          .then(r =>{}).catch(e=>{console.log(e)});
      } else {
        this.saleService.loadPage(apiPage);
      }
    }
  }

  clearSearch() {
    this.searchService.term.set('');
    this.loadData();
  }

  clearFilters() {
    this.searchService.term.set('');
    this.saleService.loadPage(0);
  }

  exportCSV() {
    const rows = this.saleService.sales();
    const header = ['ID', 'Date', 'Client', 'Articles', 'Montant (FCFA)', 'Marge (FCFA)', 'Utilisateur'];
    const data = rows.map(s => [
      s.id,
      new Date(s.saleDate).toLocaleString('fr-FR'),
      s.customerName, s.itemCount, s.totalAmount, s.totalMargin,
      s.userName,
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
