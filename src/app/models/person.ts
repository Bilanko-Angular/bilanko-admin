export type Role = 'ADMIN' | 'USER' | 'MANAGER';

export interface User {
  id?: number;
  nom?: string;
  subname?: string;
  email?: string;
  role?: Role;
  password?: string;
  profilePicture?: string;
  phoneNumber?: string;
  companyName?: string;
}

export interface NotificationPreferences {
  stockAlerts: boolean;
  newSales: boolean;
  monthlyReports: boolean;
  updates: boolean;
}

export interface AppearancePreferences {
  theme: string;
  language: string;
  dateFormat: string;
  currency: string;
  compactMode: boolean;
}