import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  readonly theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;
      document.documentElement.setAttribute('data-bs-theme', this.theme());
      document.documentElement.setAttribute('data-theme', this.theme());
      localStorage.setItem('admin-theme', this.theme());
    });
  }

  private getInitialTheme(): Theme {
    if (!this.isBrowser) return 'light';
    const saved = localStorage.getItem('admin-theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  toggle() {
    this.theme.update(t => t === 'light' ? 'dark' : 'light');
  }
}