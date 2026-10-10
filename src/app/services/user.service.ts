import { Injectable, signal } from '@angular/core';

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'blocked';
  createdAt: string;
  lastLogin: string;
  city: string;
  productsCount: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private users = signal<AdminUser[]>([
    { id: 1, name: 'Jean Mballa',    email: 'jean.mballa@mail.com',    phone: '+237 690 00 00 01', role: 'ADMIN',   status: 'active',  createdAt: '12/01/2026', lastLogin: 'Aujourd\'hui 08:14', city: 'Yaoundé', productsCount: 24 },
    { id: 2, name: 'Awa Ngono',      email: 'awa.ngono@mail.com',      phone: '+237 690 00 00 02', role: 'MANAGER', status: 'active',  createdAt: '03/02/2026', lastLogin: 'Hier 17:42',         city: 'Douala',  productsCount: 58 },
    { id: 3, name: 'Paul Fotso',     email: 'paul.fotso@mail.com',     phone: '+237 690 00 00 03', role: 'USER',    status: 'blocked', createdAt: '20/03/2026', lastLogin: 'Il y a 5 jours',     city: 'Bafoussam', productsCount: 12 },
    { id: 4, name: 'Chantal Biya',   email: 'chantal.biya@mail.com',   phone: '+237 690 00 00 04', role: 'USER',    status: 'active',  createdAt: '15/04/2026', lastLogin: 'Aujourd\'hui 10:03', city: 'Yaoundé', productsCount: 7 },
    { id: 5, name: 'Marc Essomba',   email: 'marc.essomba@mail.com',   phone: '+237 690 00 00 05', role: 'MANAGER', status: 'active',  createdAt: '22/04/2026', lastLogin: 'Aujourd\'hui 09:22', city: 'Douala',  productsCount: 41 },
    { id: 6, name: 'Nadège Tchoumi', email: 'nadege.tchoumi@mail.com', phone: '+237 690 00 00 06', role: 'USER',    status: 'active',  createdAt: '02/05/2026', lastLogin: 'Hier 22:18',         city: 'Kribi',   productsCount: 3 },
    { id: 7, name: 'Serge Kamdem',   email: 'serge.kamdem@mail.com',   phone: '+237 690 00 00 07', role: 'USER',    status: 'blocked', createdAt: '11/05/2026', lastLogin: 'Il y a 2 semaines',  city: 'Buea',    productsCount: 0 },
    { id: 8, name: 'Estelle Ngo',    email: 'estelle.ngo@mail.com',    phone: '+237 690 00 00 08', role: 'ADMIN',   status: 'active',  createdAt: '19/06/2026', lastLogin: 'Aujourd\'hui 07:56', city: 'Yaoundé', productsCount: 89 },
  ]);

  list() { return this.users; }

  update(id: number, changes: Partial<AdminUser>) {
    this.users.update(list => list.map(u => u.id === id ? { ...u, ...changes } : u));
  }

  add(user: AdminUser) {
    this.users.update(list => [...list, user]);
  }

  toggleBlock(id: number) {
    this.users.update(list =>
      list.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u)
    );
  }

  delete(id: number) {
    this.users.update(list => list.filter(u => u.id !== id));
  }
}