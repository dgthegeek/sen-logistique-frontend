import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

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
import { vendeurGuard } from './core/guards/role.guard';
import { TrackingHomeComponent } from './pages/tracking-home/tracking-home.component';
import { TrackingDetailComponent } from './pages/tracking-detail/tracking-detail.component';
import { DeliveryConfirmComponent } from './pages/delivery-confirm/delivery-confirm.component';

export const routes: Routes = [
  // Public tracking pages
  { path: 'tracking', component: TrackingHomeComponent },
  { path: 'tracking/:numero', component: TrackingDetailComponent },
  { path: '', redirectTo: '/tracking', pathMatch: 'full' },
  { path: 'delivery/:numero', component: DeliveryConfirmComponent },
  
  // Auth
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Vendeur routes
  {
    path: 'vendeur',
    canActivate: [authGuard, vendeurGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: VendeurDashboardComponent },
      { path: 'creer-livraison', component: CreerLivraisonComponent },
      { path: 'livraisons/:id', component: LivraisonDetailComponent },
      { path: 'livraisons', component: LivraisonsComponent },
      { path: 'finances', component: VendeurFinancesComponent },
    ]
  },

  // Admin routes
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'ramassages', component: RamassagesComponent },
      { path: 'livraisons', component: AdminLivraisonsComponent },
      { path: 'finances', component: AdminFinancesComponent },
    ]
  },

  // Fallback
  { path: '**', redirectTo: '/login' }
];