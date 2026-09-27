import {UserRole} from '../type/user-role';

export interface AdminUser {
  id: number;
  name: string;
  subname: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: 'active' | 'blocked';
  createdAt: Date;
  lastLogin: Date;
  city: string;
  productsCount: number;
}
