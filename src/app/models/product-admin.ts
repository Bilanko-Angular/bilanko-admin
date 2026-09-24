export type StatutStockAdmin = 'ok' | 'warning' | 'error';

export interface ProduitAdmin {
  id: string;
  nom: string;
  reference: string;
  categorie: string;
  prixAchat: number;
  quantiteStock: number;
  seuilAlerte: number;
  proprietaireNom: string;
  proprietaireCommerce: string;
}