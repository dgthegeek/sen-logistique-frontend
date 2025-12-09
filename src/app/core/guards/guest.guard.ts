import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔐 Guest Guard - Vérification...');

  const user = authService.getCurrentUser();

  // Si l'utilisateur est connecté, rediriger selon son rôle
  if (user) {
    console.log('⚠️ Guest Guard - Utilisateur déjà connecté');
    
    if (user.role === 'ADMIN') {
      router.navigate(['/admin/dashboard']);
    } else {
      router.navigate(['/vendeur/dashboard']);
    }
    
    return false;
  }

  console.log('✅ Guest Guard - PASSED (pas connecté)');
  return true;
};