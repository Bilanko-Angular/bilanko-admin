import { Injectable } from '@angular/core';

export interface Kpi {
  label: string;
  value: string;
  icon: string;
  trend: string;
  trendPositive: boolean;
}

export interface RecentUser {
  name: string;
  email: string;
  date: string;
}

export interface StockAlert {
  name: string;
  status: string;
  qty: number;
  level: 'low' | 'mid';
}

export interface SupplierShare {
  name: string;
  desc: string;
  amount: number;
  color: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {

  getKpis(): Kpi[] {
    return [
      { label: 'Utilisateurs', value: '128', icon: 'group', trend: '+12%', trendPositive: true },
      { label: 'Produits', value: '342', icon: 'inventory_2', trend: '+4%', trendPositive: true },
      { label: "Ventes du mois", value: '89', icon: 'shopping_cart', trend: '+18%', trendPositive: true },
      { label: 'Revenu du mois', value: '1 240 000 FCFA', icon: 'payments', trend: '-3%', trendPositive: false },
    ];
  }

  /** Évolution sur 7 jours : CA, Marge, Charges */
  getActivityEvolution() {
    return {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      ca:      [45000, 62000, 38000, 85000, 72000, 95000, 68000],
      marge:   [15000, 22000, 12000, 31000, 25000, 34000, 24000],
      charges: [18000, 25000, 14000, 22000, 19000, 28000, 20000],
    };
  }

  getRecentUsers(): RecentUser[] {
    return [
      { name: 'Jean Mballa',  email: 'jean.mballa@mail.com',  date: '08/09/2026' },
      { name: 'Awa Ngono',    email: 'awa.ngono@mail.com',    date: '07/09/2026' },
      { name: 'Paul Fotso',   email: 'paul.fotso@mail.com',   date: '05/09/2026' },
    ];
  }

  getRecentSales() {
    return [
      { id: 1, date: '07/09/2026 17:36', client: 'Restaurant Le Palo',      items: 1,  total: 2000,  margin: 700 },
      { id: 2, date: '07/09/2026 16:15', client: 'Boulangerie du Centre',   items: 4,  total: 15500, margin: 4200 },
      { id: 3, date: '07/09/2026 14:20', client: 'Superette Horizon',       items: 12, total: 48000, margin: 12000 },
      { id: 4, date: '06/09/2026 19:45', client: 'Kiosque Hassan',          items: 3,  total: 6500,  margin: 1800 },
      { id: 5, date: '06/09/2026 11:10', client: 'Pharmacie Saint-Paul',    items: 2,  total: 9000,  margin: 2500 },
    ];
  }

  getStockAlerts(): StockAlert[] {
    return [
      { name: 'Huile de palme 1L',    status: "Seuil d'alerte atteint", qty: 2, level: 'low' },
      { name: 'Savon Lux 100g',       status: "Seuil d'alerte atteint", qty: 3, level: 'low' },
      { name: 'Riz parfumé 5kg',      status: 'Stock bas',              qty: 8, level: 'mid' },
      { name: 'Lait en poudre 400g',  status: 'Stock bas',              qty: 9, level: 'mid' },
    ];
  }

  getSupplierShares(): SupplierShare[] {
    return [
      { name: 'ETS Nsamba & Fils',       desc: 'Fréquence : Très élevée (Hebdomadaire)', amount: 52000, color: '#022C22' },
      { name: 'Grossiste Fokou',         desc: 'Fréquence : Élevée (3x / mois)',         amount: 38000, color: '#04C966' },
      { name: 'Brasseries du Cameroun',  desc: 'Fréquence : Régulière (2x / mois)',      amount: 26000, color: '#05DF72' },
      { name: 'Sitronex Sarl',           desc: 'Fréquence : Occasionnelle',              amount: 14000, color: '#83A393' },
      { name: 'Sodicam Distro',          desc: 'Fréquence : Rare',                       amount: 8000,  color: '#D1FAE5' },
    ];
  }
}