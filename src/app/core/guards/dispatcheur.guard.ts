import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const dispatcheurGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // L'admin a aussi accès à l'écran dispatch (supervision)
  if (authService.isDispatcheur() || authService.isAdmin()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
