import {
  Component, inject, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy, effect
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { DashboardStoreService } from '../../service/store/dashboard/dashboard-store.service';
import { DashboardSummaryDTO } from '../../service/api/dashboard/dashboard-api.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  store = inject(DashboardStoreService);

  @ViewChild('lineChart')  lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutChart') donutChartRef!: ElementRef<HTMLCanvasElement>;

  private lineChart?: Chart;
  private donutChart?: Chart;
  private chartsRendered = false;

  today = new Date();
  dateDebut = '2026-09-01';
  dateFin = '2026-09-07';

  constructor() {
    // Dès que les données arrivent du store, on (re)construit les graphiques
    effect(() => {
      const summary = this.store.summary();
      if (summary && this.chartsRendered) {
        this.updateCharts(summary);
      } else if (summary && !this.chartsRendered) {
        // AfterViewInit peut avoir déjà été appelé, on tente ici aussi
        setTimeout(() => this.buildCharts(summary), 0);
      }
    });
  }

  ngOnInit() {
    this.store.loadSummary();
  }

  ngAfterViewInit() {
    this.chartsRendered = true;
    const summary = this.store.summary();
    if (summary) {
      this.buildCharts(summary);
    }
  }

  ngOnDestroy() {
    this.lineChart?.destroy();
    this.donutChart?.destroy();
  }

  // ── Accesseurs sur les signaux ─────────────────────────────────────────────
  get kpis()        { return this.store.summary()?.kpis        ?? []; }
  get recentUsers() { return this.store.summary()?.recentUsers ?? []; }
  get recentSales() { return this.store.summary()?.recentSales ?? []; }
  get stockAlerts() { return this.store.summary()?.stockAlerts ?? []; }
  get suppliers()   { return this.store.summary()?.suppliers   ?? []; }
  get totalCharges(){ return this.suppliers.reduce((s, f) => s + f.amount, 0); }

  // ── Construction initiale des graphiques ──────────────────────────────────
  private buildCharts(summary: DashboardSummaryDTO) {
    if (this.lineChartRef)  this.renderLineChart(summary);
    if (this.donutChartRef) this.renderDonutChart(summary);
  }

  // ── Mise à jour des graphiques après rechargement ─────────────────────────
  private updateCharts(summary: DashboardSummaryDTO) {
    this.lineChart?.destroy();
    this.donutChart?.destroy();
    this.buildCharts(summary);
  }

  // ── GRAPHIQUE LIGNE (activité) ─────────────────────────────────────────────
  private renderLineChart(summary: DashboardSummaryDTO) {
    const data = summary.activity;

    const styles = getComputedStyle(document.documentElement);
    const cPrimary  = styles.getPropertyValue('--color-primary').trim()   || '#05DF72';
    const cPositive = styles.getPropertyValue('--color-positive').trim()  || '#065F46';
    const cNegative = styles.getPropertyValue('--color-negative').trim()  || '#DC2626';
    const cGrid     = styles.getPropertyValue('--color-border').trim()    || '#E2EFE9';
    const cText     = styles.getPropertyValue('--color-text-muted').trim()|| '#526E60';

    this.lineChart = new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Chiffre d'affaires",
            data: data.ca,
            borderColor: cPrimary,
            backgroundColor: this.hexToRgba(cPrimary, 0.15),
            tension: 0.35, fill: true,
            pointBackgroundColor: '#fff', pointBorderColor: cPrimary,
            pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6,
          },
          {
            label: 'Marge',
            data: data.marge,
            borderColor: cPositive,
            backgroundColor: this.hexToRgba(cPositive, 0.12),
            tension: 0.35, fill: true,
            pointBackgroundColor: '#fff', pointBorderColor: cPositive,
            pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6,
          },
          {
            label: 'Charges',
            data: data.charges,
            borderColor: cNegative,
            backgroundColor: this.hexToRgba(cNegative, 0.10),
            tension: 0.35, fill: true,
            pointBackgroundColor: '#fff', pointBorderColor: cNegative,
            pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111827', padding: 10,
            titleFont: { size: 12, weight: 'bold' }, bodyFont: { size: 12 },
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label} : ${(ctx.parsed.y as number).toLocaleString('fr-FR')} FCFA`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: cText, font: { size: 11 } },
            border: { color: cGrid },
          },
          y: {
            beginAtZero: true,
            grid: { color: cGrid },
            ticks: { color: cText, font: { size: 11 }, callback: (v) => `${(v as number) / 1000}k` },
            border: { display: false },
          },
        },
      },
    });
  }

  // ── GRAPHIQUE DONUT (fournisseurs) ─────────────────────────────────────────
  private renderDonutChart(summary: DashboardSummaryDTO) {
    const labels = summary.suppliers.map((s) => s.name);
    const values = summary.suppliers.map((s) => s.amount);
    const colors = summary.suppliers.map((s) => s.color);

    this.donutChart = new Chart(this.donutChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: colors, borderColor: 'transparent', borderWidth: 0, hoverOffset: 8 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111827', padding: 10,
            callbacks: {
              label: (ctx) => {
                const total = values.reduce((a, b) => a + b, 0);
                const pct = ((ctx.parsed / total) * 100).toFixed(0);
                return ` ${ctx.label} : ${ctx.parsed.toLocaleString('fr-FR')} FCFA (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }

  // ── Utilitaire hex → rgba ──────────────────────────────────────────────────
  private hexToRgba(hex: string, alpha: number): string {
    if (!hex.startsWith('#')) return hex;
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  initial(name: string) { return name.charAt(0).toUpperCase(); }
}
