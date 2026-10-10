import { Injectable, signal } from '@angular/core';

export interface SaleItemAdmin {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface AdminSale {
  id: number;
  date: string;
  client: string;
  totalAmount: number;
  totalMargin: number;
  itemsCount: number;
  userId: number;
  userName: string;
  status: 'paid' | 'pending';
  items: SaleItemAdmin[];
}

@Injectable({ providedIn: 'root' })
export class SaleService {
  private sales = signal<AdminSale[]>([
    { id: 1, date: '2026-09-10T17:36', client: 'Restaurant Le Palo', totalAmount: 2000, totalMargin: 700, itemsCount: 1, userId: 1, userName: 'Jean Mballa', status: 'paid', items: [{ productName: 'Sac de riz 25kg', quantity: 1, unitPrice: 2000 }] },
    { id: 2, date: '2026-09-10T16:15', client: 'Boulangerie du Centre', totalAmount: 15500, totalMargin: 4200, itemsCount: 4, userId: 2, userName: 'Awa Ngono', status: 'paid', items: [{ productName: 'Farine 50kg', quantity: 4, unitPrice: 3875 }] },
    { id: 3, date: '2026-09-10T14:20', client: 'Superette Horizon', totalAmount: 48000, totalMargin: 12000, itemsCount: 12, userId: 1, userName: 'Jean Mballa', status: 'paid', items: [{ productName: 'Boissons', quantity: 12, unitPrice: 4000 }] },
    { id: 4, date: '2026-09-09T19:45', client: 'Kiosque Hassan', totalAmount: 6500, totalMargin: 1800, itemsCount: 3, userId: 5, userName: 'Marc Essomba', status: 'paid', items: [{ productName: 'Pain', quantity: 3, unitPrice: 2166 }] },
    { id: 5, date: '2026-09-09T11:10', client: 'Pharmacie Saint-Paul', totalAmount: 9000, totalMargin: 2500, itemsCount: 2, userId: 4, userName: 'Chantal Biya', status: 'pending', items: [{ productName: 'Produits pharmaceutiques', quantity: 2, unitPrice: 4500 }] },
    { id: 6, date: '2026-09-08T15:30', client: 'Marché Central', totalAmount: 32000, totalMargin: 8500, itemsCount: 8, userId: 2, userName: 'Awa Ngono', status: 'paid', items: [{ productName: 'Légumes', quantity: 8, unitPrice: 4000 }] },
    { id: 7, date: '2026-09-08T10:00', client: 'Client comptant', totalAmount: 12000, totalMargin: 3000, itemsCount: 5, userId: 6, userName: 'Nadège Tchoumi', status: 'paid', items: [{ productName: 'Savon', quantity: 5, unitPrice: 2400 }] },
    { id: 8, date: '2026-09-07T16:20', client: 'Hôtel Beauséjour', totalAmount: 85000, totalMargin: 22000, itemsCount: 20, userId: 8, userName: 'Estelle Ngo', status: 'paid', items: [{ productName: 'Nourriture', quantity: 20, unitPrice: 4250 }] },
    { id: 9, date: '2026-09-07T11:45', client: 'Épicerie Mbouda', totalAmount: 24000, totalMargin: 6000, itemsCount: 6, userId: 1, userName: 'Jean Mballa', status: 'pending', items: [{ productName: 'Huile', quantity: 6, unitPrice: 4000 }] },
    { id: 10, date: '2026-09-06T14:00', client: 'Client comptant', totalAmount: 4500, totalMargin: 1200, itemsCount: 2, userId: 3, userName: 'Paul Fotso', status: 'paid', items: [{ productName: 'Produits divers', quantity: 2, unitPrice: 2250 }] },
  ]);

  list() { return this.sales; }

  update(id: number, changes: Partial<AdminSale>) {
    this.sales.update(list => list.map(s => s.id === id ? { ...s, ...changes } : s));
  }

  add(sale: AdminSale) {
    this.sales.update(list => [sale, ...list]);
  }

  delete(id: number) {
    this.sales.update(list => list.filter(s => s.id !== id));
  }
}