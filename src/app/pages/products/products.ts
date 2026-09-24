import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductAdminService } from '../../services/product-admin.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  private readonly productAdminService = inject(ProductAdminService);

  readonly produits = this.productAdminService.produits;
  readonly recherche = signal('');
  readonly filtreCategorie = signal('toutes');
  readonly filtreStatut = signal<'tous' | 'ok' | 'warning' | 'error'>('tous');

  readonly categories = computed(() =>
    Array.from(new Set(this.produits().map((p) => p.categorie))).sort()
  );

  readonly produitsFiltres = computed(() => {
    const terme = this.recherche().trim().toLowerCase();
    const categorie = this.filtreCategorie();
    const statut = this.filtreStatut();
    return this.produits().filter((p) => {
      const matchTerme =
        !terme ||
        p.nom.toLowerCase().includes(terme) ||
        p.reference.toLowerCase().includes(terme) ||
        p.proprietaireCommerce.toLowerCase().includes(terme);
      const matchCategorie = categorie === 'toutes' || p.categorie === categorie;
      const matchStatut = statut === 'tous' || this.productAdminService.statutStock(p) === statut;
      return matchTerme && matchCategorie && matchStatut;
    });
  });

  readonly valeurTotaleStock = computed(() =>
    this.produits().reduce((s, p) => s + p.quantiteStock * p.prixAchat, 0)
  );
  readonly totalRuptures = computed(() =>
    this.produits().filter((p) => this.productAdminService.statutStock(p) === 'error').length
  );

  statutStock(p: any) { return this.productAdminService.statutStock(p); }

  formaterMontant(montant: number): string {
    return montant.toLocaleString('fr-FR') + ' FCFA';
  }

  initiale(texte: string): string {
    return texte.charAt(0).toUpperCase();
  }
}