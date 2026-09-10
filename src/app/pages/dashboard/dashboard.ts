import {
  Component, inject, AfterViewInit, ElementRef, ViewChild, OnDestroy
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { DashboardService, Kpi, RecentUser, StockAlert, SupplierShare } from '../../services/dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements AfterViewInit, OnDestroy {
  private dashboardService = inject(DashboardService);

  @ViewChild('lineChart')    lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutChart')   donutChartRef!: ElementRef<HTMLCanvasElement>;

  private lineChart?: Chart;
  private donutChart?: Chart;

  today = new Date();
  dateDebut = '2026-09-01';
  dateFin = '2026-09-07';

  kpis: Kpi[] = this.dashboardService.getKpis();
  recentUsers: RecentUser[] = this.dashboardService.getRecentUsers();
  recentSales = this.dashboardService.getRecentSales();
  stockAlerts: StockAlert[] = this.dashboardService.getStockAlerts();
  suppliers: SupplierShare[] = this.dashboardService.getSupplierShares();

  get totalCharges() {
    return this.suppliers.reduce((s, f) => s + f.amount, 0);
  }

  ngAfterViewInit() {
    this.renderLineChart();
    this.renderDonutChart();
  }

  ngOnDestroy() {
    this.lineChart?.destroy();
    this.donutChart?.destroy();
  }

  // ─────────────────────────────────────────
  // GRAPHIQUE LIGNE (activité)
  // ─────────────────────────────────────────
  private renderLineChart() {
    const data = this.dashboardService.getActivityEvolution();

    // Lire les couleurs depuis les variables CSS du thème
    const styles = getComputedStyle(document.documentElement);
    const cPrimary = styles.getPropertyValue('--color-primary').trim() || '#05DF72';
    const cPositive = styles.getPropertyValue('--color-positive').trim() || '#065F46';
    const cNegative = styles.getPropertyValue('--color-negative').trim() || '#DC2626';
    const cGrid = styles.getPropertyValue('--color-border').trim() || '#E2EFE9';
    const cText = styles.getPropertyValue('--color-text-muted').trim() || '#526E60';

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
            tension: 0.35,
            fill: true,
            pointBackgroundColor: '#fff',
            pointBorderColor: cPrimary,
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Marge',
            data: data.marge,
            borderColor: cPositive,
            backgroundColor: this.hexToRgba(cPositive, 0.12),
            tension: 0.35,
            fill: true,
            pointBackgroundColor: '#fff',
            pointBorderColor: cPositive,
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Charges',
            data: data.charges,
            borderColor: cNegative,
            backgroundColor: this.hexToRgba(cNegative, 0.10),
            tension: 0.35,
            fill: true,
            pointBackgroundColor: '#fff',
            pointBorderColor: cNegative,
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
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
            backgroundColor: '#111827',
            padding: 10,
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 12 },
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
            ticks: {
              color: cText,
              font: { size: 11 },
              callback: (v) => `${(v as number) / 1000}k`,
            },
            border: { display: false },
          },
        },
      },
    });
  }

  // ─────────────────────────────────────────
  // GRAPHIQUE DONUT (fournisseurs)
  // ─────────────────────────────────────────
  private renderDonutChart() {
    const labels = this.suppliers.map((s) => s.name);
    const values = this.suppliers.map((s) => s.amount);
    const colors = this.suppliers.map((s) => s.color);

    this.donutChart = new Chart(this.donutChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: 'transparent',
          borderWidth: 0,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111827',
            padding: 10,
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

  // Utilitaire : hex → rgba
  private hexToRgba(hex: string, alpha: number): string {
    if (!hex.startsWith('#')) return hex;
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  initial(name: string) { return name.charAt(0).toUpperCase(); }
}