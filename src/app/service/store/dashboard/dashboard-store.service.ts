import { Injectable, signal, inject } from '@angular/core';
import { DashboardApiService, DashboardSummaryDTO } from '../api/dashboard/dashboard-api.service';

@Injectable({ providedIn: 'root' })
export class DashboardStoreService {
  private api = inject(DashboardApiService);

  // State
  summary = signal<DashboardSummaryDTO | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  loadSummary() {
    this.loading.set(true);
    this.error.set(null);
    
    this.api.getSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement du dashboard', err);
        this.error.set('Impossible de charger les données du dashboard.');
        this.loading.set(false);
      }
    });
  }
}
