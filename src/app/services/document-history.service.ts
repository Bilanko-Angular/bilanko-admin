import { Injectable, signal } from '@angular/core';
import { DocumentHistorique } from '../models/document-history';

@Injectable({ providedIn: 'root' })
export class DocumentHistoryService {
  private readonly _documents = signal<DocumentHistorique[]>([
    { id: 'd1', utilisateurNom: 'Mesmine Kamtchoua', utilisateurCommerce: 'Ets Mballa & Fils', type: 'pret_bancaire', reference: 'BLK-20260906-4821', montant: 1000000, genereLe: '2026-09-06T14:22:00' },
    { id: 'd2', utilisateurNom: 'Jean Fotso', utilisateurCommerce: 'Boutique La Grâce', type: 'dsf_smt', reference: 'BLK-20260904-1190', montant: 45000, genereLe: '2026-09-04T09:10:00' },
    { id: 'd3', utilisateurNom: 'Aïcha Njoya', utilisateurCommerce: 'Épicerie Centrale', type: 'pret_bancaire', reference: 'BLK-20260901-7734', montant: 500000, genereLe: '2026-09-01T16:45:00' },
    { id: 'd4', utilisateurNom: 'Paul Essomba', utilisateurCommerce: 'Transport Express', type: 'dsf_smt', reference: 'BLK-20260828-2245', montant: 78000, genereLe: '2026-08-28T11:30:00' },
    { id: 'd5', utilisateurNom: 'Grace Talla', utilisateurCommerce: 'Restaurant Le Palo', type: 'pret_bancaire', reference: 'BLK-20260825-9081', montant: 2000000, genereLe: '2026-08-25T08:05:00' },
    { id: 'd6', utilisateurNom: 'Mesmine Kamtchoua', utilisateurCommerce: 'Ets Mballa & Fils', type: 'dsf_smt', reference: 'BLK-20260820-3312', montant: 30000, genereLe: '2026-08-20T13:15:00' },
    { id: 'd7', utilisateurNom: 'Jean Fotso', utilisateurCommerce: 'Boutique La Grâce', type: 'pret_bancaire', reference: 'BLK-20260815-6650', montant: 750000, genereLe: '2026-08-15T10:00:00' },
  ]);

  readonly documents = this._documents.asReadonly();
}