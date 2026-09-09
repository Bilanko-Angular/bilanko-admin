import { Component, AfterViewInit, ElementRef, ViewChild, inject, computed } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService, Kpi, RecentUser } from '../../services/dashboard.service';
import { UserService } from '../../services/user.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements AfterViewInit {
  private dashboardService = inject(DashboardService);
  private userService = inject(UserService);
  @ViewChild('evolutionChart') chartRef!: ElementRef<HTMLCanvasElement>;

  kpis: Kpi[] = this.dashboardService.getKpis();
  recentUsers: RecentUser[] = this.dashboardService.getRecentUsers();

  // Nombre total d'utilisateurs (réel)
  totalUsers = computed(() => this.userService.list().length);

  ngAfterViewInit() {
    const data = this.dashboardService.getSalesEvolution();
    new Chart(this.chartRef.nativeElement, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Ventes (FCFA)',
            data: data.values,
            borderColor: '#05DF72',
            backgroundColor: 'rgba(5, 223, 114, 0.1)',
            tension: 0.35,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  initial(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}