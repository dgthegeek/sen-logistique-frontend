import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { vendeurGuard } from './core/guards/vendeur.guard';
import { guestGuard } from './core/guards/guest.guard';

// Vendeur imports
import { DashboardComponent as VendeurDashboardComponent } from './features/vendeur/dashboard/dashboard.component';
import { CreerLivraisonComponent } from './features/vendeur/creer-livraison/creer-livraison.component';
import { LivraisonsComponent } from './features/vendeur/livraisons/livraisons.component';
import { LivraisonDetailComponent } from './features/vendeur/livraison-detail/livraison-detail.component';
import { FinancesComponent as VendeurFinancesComponent } from './features/vendeur/finances/finances.component';

// Admin imports
import { AdminDashboardComponent } from './features/admin/dashboard/dashboard.component';
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

export const routes: Routes = [
  // Landing page comme page par défaut
  { path: '', component: LandingComponent },
  
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
      { path: 'finances', component: VendeurFinancesComponent },
    ]
  },

  // Admin routes (avec authGuard + adminGuard)
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'ramassages', component: RamassagesComponent },
      { path: 'livraisons', component: AdminLivraisonsComponent },
      { path: 'finances', component: AdminFinancesComponent },
      { path: 'vendeurs', component: GestionVendeursComponent },
    ]
  },

  // Fallback Landing
  { path: '**', redirectTo: '' }
];