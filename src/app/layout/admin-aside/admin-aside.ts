import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-aside',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-aside.html',
  styleUrls: ['./admin-aside.css'],
})
export class AdminAsideComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  isOpen = signal(false);

  userCount = 128;
  adminInitials = 'AD';

  openMenu() {
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeMenu() {
    this.isOpen.set(false);
    document.body.style.overflow = '';
  }
 toggleMenu() {
    this.isOpen.update(v => !v);
    document.body.style.overflow = this.isOpen() ? 'hidden' : '';
  }

  logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      this.closeMenu();
      this.auth.logout();
      this.router.navigate(['/login']);
    }
  }

  onLogoError(event: Event) {
    // Si le logo ne charge pas, on log pour debug
    console.warn('Logo introuvable. Vérifie src/assets/images/logo.png');
  }
}