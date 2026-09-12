export type TypeDocumentHistorique = 'pret_bancaire' | 'dsf_smt';

export interface DocumentHistorique {
  id: string;
  utilisateurNom: string;
  utilisateurCommerce: string;
  type: TypeDocumentHistorique;
  reference: string;
  montant: number;
  genereLe: string; // ISO
}

export const LABELS_TYPE_DOCUMENT: Record<TypeDocumentHistorique, string> = {
  pret_bancaire: 'Demande de prêt',
  dsf_smt: 'Déclaration fiscale',
};