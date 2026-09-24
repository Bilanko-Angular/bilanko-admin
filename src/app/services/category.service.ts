import { Injectable, signal } from '@angular/core';

export interface AdminCategory {
  id: number;
  name: string;
  createdAt: string;
  productsCount: number;
  usersCount: number;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categories = signal<AdminCategory[]>([
    { id: 1, name: 'Informatique',     createdAt: '2026-01-15', productsCount: 42, usersCount: 12 },
    { id: 2, name: 'Énergie',          createdAt: '2026-01-22', productsCount: 18, usersCount: 7 },
    { id: 3, name: 'Alimentaire',      createdAt: '2026-02-03', productsCount: 96, usersCount: 24 },
    { id: 4, name: 'Boissons',         createdAt: '2026-02-14', productsCount: 51, usersCount: 15 },
    { id: 5, name: 'Cosmétiques',      createdAt: '2026-03-01', productsCount: 27, usersCount: 9 },
    { id: 6, name: 'Vêtements',        createdAt: '2026-03-18', productsCount: 63, usersCount: 18 },
    { id: 7, name: 'Électronique',     createdAt: '2026-04-05', productsCount: 35, usersCount: 11 },
    { id: 8, name: 'Papeterie',        createdAt: '2026-04-21', productsCount: 22, usersCount: 6 },
    { id: 9, name: 'Mobilier',         createdAt: '2026-05-08', productsCount: 14, usersCount: 4 },
    { id: 10, name: 'Hygiène',         createdAt: '2026-05-25', productsCount: 31, usersCount: 10 },
  ]);

  list() { return this.categories; }

  update(id: number, changes: Partial<AdminCategory>) {
    this.categories.update(list => list.map(c => c.id === id ? { ...c, ...changes } : c));
  }

  add(category: AdminCategory) {
    this.categories.update(list => [...list, category]);
  }

  delete(id: number) {
    this.categories.update(list => list.filter(c => c.id !== id));
  }
}