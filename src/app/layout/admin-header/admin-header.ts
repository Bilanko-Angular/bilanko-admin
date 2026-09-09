import { Component, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {ThemeService} from "../../services/theme.service";


@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [],
  templateUrl: './admin-header.html',
  styleUrls: ['./admin-header.css'],
})
export class AdminHeaderComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  protected themeService = inject(ThemeService);

  toggleMenu = output<void>();
  profileOpen = signal(false);

  get pageTitle(): string {
    const url = this.router.url;
    if (url.includes('dashboard')) return 'Tableau de bord';
    if (url.includes('users')) return 'Utilisateurs';
    if (url.includes('products')) return 'Produits';
    if (url.includes('charges')) return 'Charges';
    if (url.includes('sales')) return 'Ventes';
    if (url.includes('categories')) return 'Catégories';
    if (url.includes('documents')) return 'Documents';
    if (url.includes('messaging')) return 'Messagerie';
    return 'Bilanko Admin';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}