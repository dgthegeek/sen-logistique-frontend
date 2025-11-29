import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/vendeur/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { vendeurGuard } from './core/guards/role.guard';
import { CreerLivraisonComponent } from './features/vendeur/creer-livraison/creer-livraison.component';
import { LivraisonsComponent } from './features/vendeur/livraisons/livraisons.component';
import { LivraisonDetailComponent } from './features/vendeur/livraison-detail/livraison-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Routes Vendeur (protégées)
  {
    path: 'vendeur',
    canActivate: [authGuard, vendeurGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'livraisons/:id', component: LivraisonDetailComponent },
      { path: 'creer-livraison', component: CreerLivraisonComponent },
      { path: 'livraisons', component: LivraisonsComponent },
      { path: 'finances', component: DashboardComponent },
    ]
  },

  { path: '**', redirectTo: '/login' }
];