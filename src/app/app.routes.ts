import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout';
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';
import { Users } from './pages/users/users';
import { Products } from './pages/products/products';
import { Charges } from './pages/charges/charges';
import { Sales } from './pages/sales/sales';
import { Categories } from './pages/categories/categories';
import { Documents } from './pages/documents/documents';
import { Messaging } from './pages/messaging/messaging';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'users', component: Users },
      { path: 'products', component: Products },
      { path: 'charges', component: Charges },
      { path: 'sales', component: Sales },
      { path: 'categories', component: Categories },
      { path: 'documents', component: Documents },
      { path: 'messaging', component: Messaging },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];