import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const vendeurGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isVendeur()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};