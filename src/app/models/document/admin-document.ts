import { TypeDocument, PretDetails, FiscalDetails } from '../DTO/document/DocumentDTOs';

export interface AdminDocument {
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
