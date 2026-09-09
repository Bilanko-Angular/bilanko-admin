import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-aside',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-aside.html',
  styleUrls: ['./admin-aside.css']
})
export class AdminAsideComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}