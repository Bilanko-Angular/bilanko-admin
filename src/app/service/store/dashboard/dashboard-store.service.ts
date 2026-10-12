import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import {
  DashboardApiService,
  DashboardSummaryDTO,
  DASHBOARD_POLL_INTERVAL_MS,
} from '../../api/dashboard/dashboard-api.service';

@Injectable({ providedIn: 'root' })
export class DashboardStoreService implements OnDestroy {
  private api = inject(DashboardApiService);

  summary = signal<DashboardSummaryDTO | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  private pollSub: Subscription | null = null;
  private hasLoadedOnce = false;

  /** Charge une seule fois le résumé (sans démarrer le polling). */
  async loadSummary(silent = false): Promise<void> {
    if (!silent || !this.hasLoadedOnce) {
      this.loading.set(true);
    }
    this.error.set(null);

    try {
      const data = await this.api.getSummary();
      this.summary.set(data);
      this.hasLoadedOnce = true;
      this.error.set(null);
    } catch (err) {
      console.error('Erreur lors du chargement du dashboard', err);
      this.error.set('Impossible de charger les données du dashboard.');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Démarre le polling (immédiat + toutes les 10 s).
   * Les rafraîchissements suivants ne réaffichent pas le loader.
   */
  startPolling(intervalMs: number = DASHBOARD_POLL_INTERVAL_MS): void {
    if (this.pollSub) {
      return;
    }

    if (!this.hasLoadedOnce) {
      this.loading.set(true);
    }
    this.error.set(null);

    this.pollSub = this.api.pollSummary(intervalMs).pipe(
      catchError((err, caught) => {
        console.error('Erreur lors du polling du dashboard', err);
        this.error.set('Impossible de charger les données du dashboard.');
        this.loading.set(false);
        // Relance le flux après l'intervalle pour ne pas bloquer le polling
        return timer(intervalMs).pipe(switchMap(() => caught));
      })
    ).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.hasLoadedOnce = true;
        this.loading.set(false);
        this.error.set(null);
      },
    });
  }

  stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = null;
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
