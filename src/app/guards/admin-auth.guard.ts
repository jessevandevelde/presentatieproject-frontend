import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasRole('superadmin')) {
    return true;
  }

  return router.parseUrl(authService.hasRole('party-admin') ? '/partij' : '/login');
};
