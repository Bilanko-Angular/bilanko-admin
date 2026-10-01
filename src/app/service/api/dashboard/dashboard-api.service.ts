import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

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

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseApiUrl}/dashboard`;

  getSummary(): Observable<DashboardSummaryDTO> {
    return this.http.get<DashboardSummaryDTO>(`${this.apiUrl}/summary`);
  }
}
