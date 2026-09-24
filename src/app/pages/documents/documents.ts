import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentHistoryService } from '../../services/document-history.service';
import { TypeDocumentHistorique, LABELS_TYPE_DOCUMENT } from '../../models/document-history';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './documents.html',
  styleUrl: './documents.css',
})
export class Documents {
  private readonly documentHistoryService = inject(DocumentHistoryService);

  readonly labelsType = LABELS_TYPE_DOCUMENT;
  readonly documents = this.documentHistoryService.documents;

  readonly recherche = signal('');
  readonly filtreType = signal<'tous' | TypeDocumentHistorique>('tous');

  readonly documentsFiltres = computed(() => {
    const terme = this.recherche().trim().toLowerCase();
    const type = this.filtreType();
    return this.documents()
      .filter((d) => type === 'tous' || d.type === type)
      .filter(
        (d) =>
          !terme ||
          d.utilisateurNom.toLowerCase().includes(terme) ||
          d.utilisateurCommerce.toLowerCase().includes(terme) ||
          d.reference.toLowerCase().includes(terme)
      )
      .sort((a, b) => b.genereLe.localeCompare(a.genereLe));
  });

  readonly totalPrets = computed(() => this.documents().filter((d) => d.type === 'pret_bancaire').length);
  readonly totalDsf = computed(() => this.documents().filter((d) => d.type === 'dsf_smt').length);

  formaterDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formaterHeure(iso: string): string {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formaterMontant(montant: number): string {
    return montant.toLocaleString('fr-FR') + ' FCFA';
  }
}