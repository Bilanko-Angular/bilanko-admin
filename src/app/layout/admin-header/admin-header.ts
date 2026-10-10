import { Component, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { SearchService } from '../../services/search.service';
import { NotificationsBell } from '../../components/notifications-bell/notifications-bell';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [FormsModule, NotificationsBell],
  templateUrl: './admin-header.html',
  styleUrls: ['./admin-header.css'],
})
export class AdminHeaderComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private searchService = inject(SearchService);
  protected themeService = inject(ThemeService);

 readonly toggleMenu = output<void>();
  profileOpen = signal(false);

 

  // Exposer le terme de recherche via un getter public
  get searchTerm() {
    return this.searchService.term;
  }

  get pageTitle(): string {
    const url = this.router.url;
    if (url.includes('dashboard')) return 'Tableau de bord';
    if (url.includes('users')) return 'Utilisateurs';
    return 'Bilanko Admin';
  }

  toggleProfile() {
    this.profileOpen.update(v => !v);
  }

  onSearch(value: string) {
    this.searchService.term.set(value);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}