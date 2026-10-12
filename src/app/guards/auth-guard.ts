import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthStoreService } from '../service/store/auth/auth-store.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthStoreService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    return true;
  }
  return router.parseUrl('/login');
};