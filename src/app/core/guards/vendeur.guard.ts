import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { StatutVendeur } from '../models/vendeur.model';

export const vendeurGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔐 Vendeur Guard - Vérification...');

  const user = authService.getCurrentUser();

  if (!user || user.role !== 'VENDEUR') {
    console.log('❌ Vendeur Guard - FAILED (pas vendeur)');
    router.navigate(['/login']);
    return false;
  }

  // ✅ VÉRIFIER LE STATUT
  console.log('👤 Statut vendeur:', user.statut);

  if (user.statut !== StatutVendeur.ACTIF) {
    console.log(`⚠️ Vendeur Guard - Statut ${user.statut}, redirection...`);
    router.navigate(['/statut-compte']); // ← PAGE UNIQUE
    return false;
  }

  console.log('✅ Vendeur Guard - PASSED');
  return true;
};