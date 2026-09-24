import { Injectable, signal } from '@angular/core';
import { ProduitAdmin } from './../models/product-admin';

@Injectable({ providedIn: 'root' })
export class ProductAdminService {
  private readonly _produits = signal<ProduitAdmin[]>([
    { id: 'p1', nom: 'MacBook Pro 16" M3 Max', reference: 'REF-001', categorie: 'Informatique', prixAchat: 2200000, quantiteStock: 45, seuilAlerte: 10, proprietaireNom: 'Mesmine Kamtchoua', proprietaireCommerce: 'Ets Mballa & Fils' },
    { id: 'p2', nom: 'Onduleur APC Smart-UPS', reference: 'REF-045', categorie: 'Énergie', prixAchat: 450000, quantiteStock: 4, seuilAlerte: 5, proprietaireNom: 'Mesmine Kamtchoua', proprietaireCommerce: 'Ets Mballa & Fils' },
    { id: 'p3', nom: 'Sac de riz 25kg', reference: 'REF-102', categorie: 'Alimentaire', prixAchat: 12000, quantiteStock: 60, seuilAlerte: 15, proprietaireNom: 'Grace Talla', proprietaireCommerce: 'Restaurant Le Palo' },
    { id: 'p4', nom: 'Huile végétale 5L', reference: 'REF-108', categorie: 'Alimentaire', prixAchat: 4200, quantiteStock: 8, seuilAlerte: 10, proprietaireNom: 'Aïcha Njoya', proprietaireCommerce: 'Épicerie Centrale' },
    { id: 'p5', nom: 'Savon liquide', reference: 'REF-211', categorie: 'Hygiène', prixAchat: 900, quantiteStock: 0, seuilAlerte: 20, proprietaireNom: 'Aïcha Njoya', proprietaireCommerce: 'Épicerie Centrale' },
    { id: 'p6', nom: 'Caisse de boissons', reference: 'REF-312', categorie: 'Boissons', prixAchat: 3200, quantiteStock: 25, seuilAlerte: 8, proprietaireNom: 'Jean Fotso', proprietaireCommerce: 'Boutique La Grâce' },
    { id: 'p7', nom: 'Sucre en poudre 1kg', reference: 'REF-118', categorie: 'Alimentaire', prixAchat: 800, quantiteStock: 3, seuilAlerte: 12, proprietaireNom: 'Jean Fotso', proprietaireCommerce: 'Boutique La Grâce' },
    { id: 'p8', nom: 'Pneus véhicule utilitaire', reference: 'REF-419', categorie: 'Transport', prixAchat: 65000, quantiteStock: 12, seuilAlerte: 4, proprietaireNom: 'Paul Essomba', proprietaireCommerce: 'Transport Express' },
  ]);

  readonly produits = this._produits.asReadonly();

  statutStock(p: ProduitAdmin): 'ok' | 'warning' | 'error' {
    if (p.quantiteStock === 0) return 'error';
    if (p.quantiteStock <= p.seuilAlerte) return 'warning';
    return 'ok';
  }
}