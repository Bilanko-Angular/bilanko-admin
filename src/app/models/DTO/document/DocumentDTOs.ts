export enum TypeDocument {
  DOCUMENT_PRET = 'DOCUMENT_PRET',
  DOCUMENT_FISCAL = 'DOCUMENT_FISCAL'
}

export enum RegimeFiscal {
  REEL = 'REEL',
  SIMPLIFIE = 'SIMPLIFIE',
  MICRO = 'MICRO'
}

export interface PretDetails {
  capitalPropre?: number;
  banque?: string;
  agence?: string;
  montantDemande?: number;
  dureeMois?: number;
  garanties?: string;
}

export interface FiscalDetails {
  regimeFiscal?: RegimeFiscal;
  regimeFiscalFrontCode?: string;
  exerciceFiscal?: string;
  centreImpots?: string;
  natureImpot?: string;
  debutPeriodeDeclaration?: string;
  finPeriodeDeclaration?: string;
  montantImpot?: string;
  datePaiement?: string;
  moyenPaiement?: string;
  referencePaiement?: string;
  chiffreAffairesPeriode?: number;
}

export interface AdminDocumentSummaryDTO {
  totalCount: number;
  pretCount: number;
  fiscalCount: number;
  usersWithDocumentsCount: number;
}

export interface AdminDocumentResponseDTO {
  id: number;
  nom: string;
  type: TypeDocument;
  frontCode: string;
  objet: string;
  dateDeGeneration: string;
  raisonSociale: string;
  userId: number;
  userName: string;
  userSubname: string;
  pret?: PretDetails;
  fiscal?: FiscalDetails;
}

export interface PretPayload {
  objetPretSlug: string;
  banque: string;
  agence: string;
  capitalPropre?: number;
  montantDemande: number;
  dureeMois: number;
  garanties?: string;
}

export interface FiscalPayload {
  regimeFiscal: string;
  exerciceFiscal: string;
  centreImpots: string;
  natureImpot: string;
  debutPeriodeDeclaration: string;
  finPeriodeDeclaration: string;
  montantImpot: string;
  datePaiement?: string;
  moyenPaiement?: string;
  referencePaiement?: string;
  chiffreAffairesPeriode?: number;
}

export interface AdminDocumentCreateRequest {
  userId: number;
  type: string;
  nom?: string;
  raisonSociale: string;
  pret?: PretPayload;
  fiscal?: FiscalPayload;
}

export interface AdminDocumentUpdateRequest {
  nom?: string;
  raisonSociale: string;
  pret?: PretPayload;
  fiscal?: FiscalPayload;
}
