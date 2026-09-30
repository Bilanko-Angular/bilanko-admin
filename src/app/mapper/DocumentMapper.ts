import { AdminDocumentResponseDTO } from '../models/DTO/document/DocumentDTOs';
import { AdminDocument } from '../models/document/admin-document';

export class DocumentMapper {
  static dtoToAdminDocument(dto: AdminDocumentResponseDTO): AdminDocument {
    return {
      id: dto.id,
      nom: dto.nom,
      type: dto.type,
      frontCode: dto.frontCode,
      objet: dto.objet,
      dateDeGeneration: dto.dateDeGeneration,
      raisonSociale: dto.raisonSociale,
      userId: dto.userId,
      userName: dto.userName,
      userSubname: dto.userSubname,
      pret: dto.pret,
      fiscal: dto.fiscal
    };
  }
}
