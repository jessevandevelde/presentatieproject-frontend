import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const partyAdminAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasRole('party-admin')) {
    return true;
  }

  return router.parseUrl(authService.hasRole('superadmin') ? '/admin' : '/login');
};
