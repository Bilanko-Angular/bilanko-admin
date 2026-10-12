import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthStoreService } from '../service/store/auth/auth-store.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthStoreService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    return router.parseUrl('/dashboard');
  }
  return true;
};