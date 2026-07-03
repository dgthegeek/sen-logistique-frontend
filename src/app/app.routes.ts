import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { vendeurGuard } from './core/guards/vendeur.guard';
import { guestGuard } from './core/guards/guest.guard';
import { closeurGuard } from './core/guards/closeur.guard';
import { livreurGuard } from './core/guards/livreur.guard';
import { dispatcheurGuard } from './core/guards/dispatcheur.guard';
import { BilanComponent } from './features/bilan/bilan.component';
import { ClassementComponent } from './features/classement/classement.component';
import { CommandeDetailComponent } from './features/commande-detail/commande-detail.component';
import { AdminPerformanceComponent } from './features/admin/performance/performance.component';

// Closing / Dispatch imports
import { CloseurCommandesComponent } from './features/closeur/commandes/commandes.component';
import { AdminDispatchComponent } from './features/admin/dispatch/dispatch.component';
import { AdminEquipeComponent } from './features/admin/equipe/equipe.component';
import { AdminStatsComponent } from './features/admin/stats/stats.component';
import { AdminStockComponent } from './features/admin/stock/stock.component';
import { VendeurMonStockComponent } from './features/vendeur/mon-stock/mon-stock.component';
import { LivreurMesLivraisonsComponent } from './features/livreur/mes-livraisons/mes-livraisons.component';

// Vendeur imports
import { DashboardComponent as VendeurDashboardComponent } from './features/vendeur/dashboard/dashboard.component';
import { CreerLivraisonComponent } from './features/vendeur/creer-livraison/creer-livraison.component';
import { LivraisonsComponent } from './features/vendeur/livraisons/livraisons.component';
import { LivraisonDetailComponent } from './features/vendeur/livraison-detail/livraison-detail.component';
import { FinancesComponent as VendeurFinancesComponent } from './features/vendeur/finances/finances.component';

// Admin imports
import { RamassagesComponent } from './features/admin/ramassages/ramassages.component';
import { AdminLivraisonsComponent } from './features/admin/livraisons/livraisons.component';
import { AdminFinancesComponent } from './features/admin/finances/finances.component';
import { GestionVendeursComponent } from './features/admin/gestion-vendeurs/gestion-vendeurs.component';

// Public pages
import { LandingComponent } from './pages/landing/landing.component';
import { TrackingHomeComponent } from './pages/tracking-home/tracking-home.component';
import { TrackingDetailComponent } from './pages/tracking-detail/tracking-detail.component';
import { DeliveryConfirmComponent } from './pages/delivery-confirm/delivery-confirm.component';
import { StatutCompteComponent } from './pages/statut-compte/statut-compte.component';
import { ZonesComponent } from './features/admin/zones/zones.component';
import { ProfilComponent } from './shared/components/profil/profil.component';
import { CreerLivraisonVendeurComponent } from './features/admin/creer-livraison-vendeur/creer-livraison-vendeur.component';
import { ImpressionQrComponent } from './features/admin/impression-qr/impression-qr.component';
import { AProposComponent } from './pages/a-propos/a-propos.component';
import { ConditionsUtilisationComponent } from './pages/conditions-utilisation/conditions-utilisation.component';
import { PolitiqueConfidentialiteComponent } from './pages/politique-confidentialite/politique-confidentialite.component';

export const routes: Routes = [
  // Landing page comme page par défaut
  { path: '', component: LandingComponent },

  { path: 'a-propos', component: AProposComponent },
  { path: 'conditions-utilisation', component: ConditionsUtilisationComponent },
  { path: 'politique-confidentialite', component: PolitiqueConfidentialiteComponent },
  
  // Page statut compte (EN_ATTENTE / SUSPENDU / BLOQUE)
  { path: 'statut-compte', component: StatutCompteComponent },

  // Public tracking pages
  { path: 'tracking', component: TrackingHomeComponent },
  { path: 'tracking/:numero', component: TrackingDetailComponent },
  { path: 'delivery/:numero', component: DeliveryConfirmComponent },
  
  // Auth (avec guestGuard pour bloquer si déjà connecté)
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [guestGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [guestGuard]
  },

  // Vendeur routes (avec authGuard + vendeurGuard)
  {
    path: 'vendeur',
    canActivate: [authGuard, vendeurGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: VendeurDashboardComponent },
      { path: 'creer-livraison', component: CreerLivraisonComponent },
      { path: 'livraisons', component: LivraisonsComponent },
      { path: 'livraisons/:id', component: LivraisonDetailComponent },
      { path: 'mon-stock', component: VendeurMonStockComponent },
      { path: 'bilan', component: BilanComponent },
      { path: 'classement', component: ClassementComponent },
      { path: 'finances', component: VendeurFinancesComponent },
      { path: 'profil', component: ProfilComponent },
    ]
  },

  // Admin routes (avec authGuard + adminGuard)
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'stats', pathMatch: 'full' },
      { path: 'dashboard', redirectTo: 'stats', pathMatch: 'full' },
      { path: 'ramassages', component: RamassagesComponent },
      { path: 'livraisons', component: AdminLivraisonsComponent },
      { path: 'finances', component: AdminFinancesComponent },
      { path: 'vendeurs', component: GestionVendeursComponent },
      { path: 'bilan', component: BilanComponent },
      { path: 'classement', component: ClassementComponent },
      { path: 'performance', component: AdminPerformanceComponent },
      { path: 'vendeurs/:id/bilan', component: BilanComponent },
      { path: 'zones', component: ZonesComponent },      // ← NOUVEAU
      { path: 'profil', component: ProfilComponent },
      { path: 'creer-livraison-vendeur', component: CreerLivraisonVendeurComponent },
      { path: 'impression-qr', component: ImpressionQrComponent },
      { path: 'dispatch', component: AdminDispatchComponent },   // ← Module Dispatch
      { path: 'equipe', component: AdminEquipeComponent },       // ← Gestion closeurs/livreurs
      { path: 'stats', component: AdminStatsComponent },         // ← Tableau de bord stats
      { path: 'stock', component: AdminStockComponent },         // ← Module Stock
    ]
  },

  // Closeur routes (module Closing)
  {
    path: 'closeur',
    canActivate: [authGuard, closeurGuard],
    children: [
      { path: '', redirectTo: 'commandes', pathMatch: 'full' },
      { path: 'commandes', component: CloseurCommandesComponent },
      { path: 'profil', component: ProfilComponent },
    ]
  },

  // Livreur routes (interface livreur)
  {
    path: 'livreur',
    canActivate: [authGuard, livreurGuard],
    children: [
      { path: '', redirectTo: 'mes-livraisons', pathMatch: 'full' },
      { path: 'mes-livraisons', component: LivreurMesLivraisonsComponent },
      { path: 'profil', component: ProfilComponent },
    ]
  },

  // Détail commande partagé (staff : closeur, dispatcheur, livreur, admin)
  { path: 'commande/:id', canActivate: [authGuard], component: CommandeDetailComponent },

  // Dispatcheur routes (module Dispatch : prépare et assigne aux livreurs)
  {
    path: 'dispatcheur',
    canActivate: [authGuard, dispatcheurGuard],
    children: [
      { path: '', redirectTo: 'dispatch', pathMatch: 'full' },
      { path: 'dispatch', component: AdminDispatchComponent },
      { path: 'profil', component: ProfilComponent },
    ]
  },

  // Fallback Landing
  { path: '**', redirectTo: '' }
];