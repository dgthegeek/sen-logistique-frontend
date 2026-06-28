import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const closeurGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // L'admin a aussi accès aux écrans closeur (supervision)
  if (authService.isCloseur() || authService.isAdmin()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
