import { Injectable, signal } from '@angular/core';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'blocked';
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  // TODO: remplacer par de vrais appels HttpClient quand le backend admin sera prêt
  private users = signal<AdminUser[]>([
    { id: 1, name: 'Jean Mballa', email: 'jean.mballa@mail.com', phone: '+237 690 00 00 01', status: 'active', createdAt: '12/01/2026' },
    { id: 2, name: 'Awa Ngono', email: 'awa.ngono@mail.com', phone: '+237 690 00 00 02', status: 'active', createdAt: '03/02/2026' },
    { id: 3, name: 'Paul Fotso', email: 'paul.fotso@mail.com', phone: '+237 690 00 00 03', status: 'blocked', createdAt: '20/03/2026' },
    { id: 4, name: 'Chantal Biya', email: 'chantal.biya@mail.com', phone: '+237 690 00 00 04', status: 'active', createdAt: '15/04/2026' },
  ]);

  list() {
    return this.users;
  }

  update(id: number, changes: Partial<AdminUser>) {
    this.users.update(list => list.map(u => (u.id === id ? { ...u, ...changes } : u)));
  }

  toggleBlock(id: number) {
    this.users.update(list =>
      list.map(u => (u.id === id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u))
    );
  }

  delete(id: number) {
    this.users.update(list => list.filter(u => u.id !== id));
  }
}