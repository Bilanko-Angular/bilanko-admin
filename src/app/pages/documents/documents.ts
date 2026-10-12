import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentStoreService } from '../../service/store/document/document-store.service';
import { TypeDocument } from '../../models/DTO/document/DocumentDTOs';
import { CommonModule } from '@angular/common';
import { AdminDocument } from '../../models/document/admin-document';

const LABELS_TYPE_DOCUMENT: Record<string, string> = {
  [TypeDocument.DOCUMENT_PRET]: 'Prêt Bancaire',
  [TypeDocument.DOCUMENT_FISCAL]: 'Déclaration Fiscale',
  // Keep support for old labels in case of hardcoded data temporarily
  'pret_bancaire': 'Prêt Bancaire',
  'dsf_smt': 'Déclaration Fiscale'
};

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './documents.html',
  styleUrl: './documents.css',
})
export class Documents implements OnInit {
  public readonly documentService = inject(DocumentStoreService);

  readonly labelsType = LABELS_TYPE_DOCUMENT;

  readonly recherche = signal('');
  readonly filtreType = signal<string>('tous');

  ngOnInit() {
    this.documentService.summary();
    this.loadData();
  }

  loadData() {
    if (this.recherche().trim() || this.filtreType() !== 'tous') {
      this.documentService.search({
        keyword: this.recherche().trim(),
        type: this.filtreType() !== 'tous' ? this.filtreType() : undefined,
        page: this.documentService.actualIndex()
      });
    } else {
      this.documentService.loadPage(this.documentService.actualIndex());
    }
  }

  onSearchChange(term: string) {
    this.recherche.set(term);
    this.loadDataWithResetPage();
  }

  onFilterChange(type: string) {
    this.filtreType.set(type);
    this.loadDataWithResetPage();
  }

  loadDataWithResetPage() {
    if (this.recherche().trim() || this.filtreType() !== 'tous') {
      this.documentService.search({
        keyword: this.recherche().trim(),
        type: this.filtreType() !== 'tous' ? this.filtreType() : undefined,
        page: 0
      });
    } else {
      this.documentService.loadPage(0);
    }
  }

  goToPage(p: number) {
    const apiPage = p - 1;
    if (apiPage >= 0 && apiPage < this.documentService.totalPage()) {
      if (this.recherche().trim() || this.filtreType() !== 'tous') {
        this.documentService.search({
          keyword: this.recherche().trim(),
          type: this.filtreType() !== 'tous' ? this.filtreType() : undefined,
          page: apiPage
        });
      } else {
        this.documentService.loadPage(apiPage);
      }
    }
  }

  // Modales
  viewingDoc = signal<AdminDocument | null>(null);
  protected $index: any;

  viewDocument(d: AdminDocument) { this.viewingDoc.set(d); }
  closeView() { this.viewingDoc.set(null); }

  formaterDate(iso: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formaterHeure(iso: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formaterMontant(d: AdminDocument): string {
    let montant = 0;
    if (d.type === TypeDocument.DOCUMENT_PRET) {
      montant = d.pret?.montantDemande || 0;
    } else if (d.type === TypeDocument.DOCUMENT_FISCAL) {
      montant = d.fiscal?.chiffreAffairesPeriode || 0;
    }
    return montant.toLocaleString('fr-FR') + ' FCFA';
  }
}
