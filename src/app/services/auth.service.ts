import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private baseUrl = environment.baseApiUrl + '/admin/auth';

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap(res => this.setToken(res.token)),
      // TODO: retirer ce fallback dès que l'API /admin/auth/login est prête côté backend
      catchError(() => {
        this.setToken('mock-admin-token');
        return of({ token: 'mock-admin-token' });
      })
    );
  }

  private setToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('admin_token', token);
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('admin_token');
    }
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('admin_token') : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}