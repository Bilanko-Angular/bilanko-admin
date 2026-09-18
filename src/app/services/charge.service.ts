import { Injectable, signal } from '@angular/core';

export type ChargeCategory = 'Transport' | 'Énergie' | 'Fournitures' | 'Communication' | 'Entretien' | 'Loyer' | 'Autre';

export interface AdminCharge {
  id: number;
  label: string;
  supplier: string;
  amount: number;
  date: string;
  category: ChargeCategory;
  userId: number;
  userName: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class ChargeService {
  private charges = signal<AdminCharge[]>([
    { id: 1, label: 'Transport des marchandises', supplier: 'Transport Express', amount: 10000, date: '2026-09-10', category: 'Transport', userId: 1, userName: 'Jean Mballa', notes: 'Livraison Douala-Yaoundé' },
    { id: 2, label: 'Électricité', supplier: 'ENEO', amount: 8500, date: '2026-09-10', category: 'Énergie', userId: 2, userName: 'Awa Ngono' },
    { id: 3, label: 'Communication', supplier: 'MTN', amount: 5000, date: '2026-09-09', category: 'Communication', userId: 1, userName: 'Jean Mballa' },
    { id: 4, label: 'Emballages', supplier: 'Fournitures Douala', amount: 7000, date: '2026-09-09', category: 'Fournitures', userId: 4, userName: 'Chantal Biya' },
    { id: 5, label: 'Loyer boutique', supplier: 'Bailleur M. Kamga', amount: 150000, date: '2026-09-08', category: 'Loyer', userId: 2, userName: 'Awa Ngono' },
    { id: 6, label: 'Nettoyage', supplier: 'Service Nettoyage', amount: 4000, date: '2026-09-08', category: 'Entretien', userId: 5, userName: 'Marc Essomba' },
    { id: 7, label: 'Transport marchandises', supplier: 'Transport Express', amount: 15000, date: '2026-09-07', category: 'Transport', userId: 1, userName: 'Jean Mballa' },
    { id: 8, label: 'Eau', supplier: 'CDE', amount: 6000, date: '2026-09-06', category: 'Énergie', userId: 8, userName: 'Estelle Ngo' },
    { id: 9, label: 'Communication', supplier: 'Orange', amount: 4000, date: '2026-09-05', category: 'Communication', userId: 2, userName: 'Awa Ngono' },
    { id: 10, label: 'Entretien magasin', supplier: 'Service Nettoyage', amount: 5000, date: '2026-09-04', category: 'Entretien', userId: 6, userName: 'Nadège Tchoumi' },
  ]);

  list() { return this.charges; }

  update(id: number, changes: Partial<AdminCharge>) {
    this.charges.update(list => list.map(c => c.id === id ? { ...c, ...changes } : c));
  }

  add(charge: AdminCharge) {
    this.charges.update(list => [charge, ...list]);
  }

  delete(id: number) {
    this.charges.update(list => list.filter(c => c.id !== id));
  }
}