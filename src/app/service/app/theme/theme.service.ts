import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private readonly storageKey = 'admin-theme'
  readonly theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;
      document.documentElement.setAttribute('data-bs-theme', this.theme());
      document.documentElement.setAttribute('data-theme', this.theme());
      localStorage.setItem('admin-theme', this.theme());
    });
  }

  getSystemTheme(): Theme {
    if (!this.isBrowser) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private getInitialTheme(): Theme {
    if (!this.isBrowser) return 'light';
    const saved = localStorage.getItem(this.storageKey) as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  toggle() {
    this.theme.update(t => t === 'light' ? 'dark' : 'light');
  }
  loadUserTheme(): void {
    if (!this.isBrowser) return;
    const saved = localStorage.getItem(this.storageKey);
    if (saved === 'light' || saved === 'dark') {
      this.theme.set(saved);
    } else {
      this.theme.set(this.getSystemTheme());
    }
  }
}
