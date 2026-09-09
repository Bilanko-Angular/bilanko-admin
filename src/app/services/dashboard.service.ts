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

@Injectable({ providedIn: 'root' })
export class DashboardService {
  // TODO: remplacer par de vrais appels HttpClient quand le backend admin sera prêt
  getKpis(): Kpi[] {
    return [
      { label: 'Utilisateurs', value: '128', icon: 'group', trend: '+12%', trendPositive: true },
      { label: 'Produits', value: '342', icon: 'inventory_2', trend: '+4%', trendPositive: true },
      { label: 'Ventes du mois', value: '89', icon: 'point_of_sale', trend: '+18%', trendPositive: true },
      { label: 'Revenu du mois', value: '1 240 000 FCFA', icon: 'payments', trend: '-3%', trendPositive: false },
    ];
  }

  getSalesEvolution() {
    return {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul'],
      values: [120000, 150000, 98000, 175000, 210000, 190000, 240000],
    };
  }

  getRecentUsers(): RecentUser[] {
    return [
      { name: 'Jean Mballa', email: 'jean.mballa@mail.com', date: '08/09/2026' },
      { name: 'Awa Ngono', email: 'awa.ngono@mail.com', date: '07/09/2026' },
      { name: 'Paul Fotso', email: 'paul.fotso@mail.com', date: '05/09/2026' },
    ];
  }
}