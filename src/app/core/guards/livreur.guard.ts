import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const livreurGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLivreur()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
