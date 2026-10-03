import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {apiClient} from '../../../core/axios/axios.config';

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

  private apiUrl = `${environment.baseApiUrl}/admin/dashboard`;

  async getSummary(): Promise<DashboardSummaryDTO> {
    const response= await apiClient.get<DashboardSummaryDTO>(`${this.apiUrl}/summary`);
    return response.data
  }
}
