import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔐 Admin Guard - Vérification...');

  if (authService.isAdmin()) {
    console.log('✅ Admin Guard - PASSED (utilisateur est admin)');
    return true;
  }

  console.log('❌ Admin Guard - FAILED (utilisateur n\'est pas admin)');
  router.navigate(['/login']);
  return false;
};