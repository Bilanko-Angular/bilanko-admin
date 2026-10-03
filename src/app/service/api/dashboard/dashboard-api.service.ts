import { Injectable } from '@angular/core';
import { Observable, from, timer } from 'rxjs';
import { exhaustMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { apiClient } from '../../../core/axios/axios.config';

export interface KpiDTO {
  label: string;
  value: string;
  icon: string;
  trend: string;
  trendPositive: boolean;
}

export interface ActivityEvolutionDTO {
  labels: string[];
  ca: number[];
  marge: number[];
  charges: number[];
}

export interface SupplierShareDTO {
  name: string;
  desc: string;
  amount: number;
  color: string;
}

export interface RecentSaleDTO {
  id: number;
  date: string;
  client: string;
  items: number;
  total: number;
  margin: number;
}

export interface RecentUserDTO {
  name: string;
  email: string;
  date: string;
}

export interface StockAlertDTO {
  name: string;
  status: string;
  qty: number;
  level: 'low' | 'mid';
}

export interface DashboardSummaryDTO {
  kpis: KpiDTO[];
  activity: ActivityEvolutionDTO;
  suppliers: SupplierShareDTO[];
  recentSales: RecentSaleDTO[];
  recentUsers: RecentUserDTO[];
  stockAlerts: StockAlertDTO[];
}

/** Intervalle de polling dashboard (ms). */
export const DASHBOARD_POLL_INTERVAL_MS = 10_000;

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {

  private apiUrl = `${environment.baseApiUrl}/admin/dashboard`;

  async getSummary(): Promise<DashboardSummaryDTO> {
    const response = await apiClient.get<DashboardSummaryDTO>(`${this.apiUrl}/summary`);
    return response.data;
  }

  /**
   * Émet le résumé immédiatement, puis toutes les `intervalMs` ms.
   * `exhaustMap` ignore un tick si la requête précédente est encore en cours.
   */
  pollSummary(intervalMs: number = DASHBOARD_POLL_INTERVAL_MS): Observable<DashboardSummaryDTO> {
    return timer(0, intervalMs).pipe(
      exhaustMap(() => from(this.getSummary()))
    );
  }
}
