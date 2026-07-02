import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StatutVendeur } from '../../core/models/vendeur.model';

@Component({
  selector: 'app-statut-compte',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './statut-compte.component.html',
  styleUrls: ['./statut-compte.component.css']
})
export class StatutCompteComponent implements OnInit {
  user = this.authService.getCurrentUser();
  StatutVendeur = StatutVendeur;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Si l'utilisateur est ACTIF, rediriger
    if (this.user?.statut === StatutVendeur.ACTIF) {
      this.router.navigate(['/vendeur/dashboard']);
    }
    
    // Si pas de user ou pas de statut, rediriger vers login
    if (!this.user || !this.user.statut) {
      this.router.navigate(['/login']);
    }
  }

  get statut() {
    return this.user?.statut;
  }

  get isEnAttente(): boolean {
    return this.statut === StatutVendeur.EN_ATTENTE_VALIDATION;
  }

  get isSuspendu(): boolean {
    return this.statut === StatutVendeur.SUSPENDU;
  }

  get isBloque(): boolean {
    return this.statut === StatutVendeur.BLOQUE;
  }

  get titre(): string {
    if (this.isEnAttente) return 'Compte en cours de validation';
    if (this.isSuspendu) return 'Compte suspendu';
    if (this.isBloque) return 'Compte bloqué';
    return 'Statut du compte';
  }

  get icon(): string {
    if (this.isEnAttente) return 'fa-solid fa-clock text-orange-500';
    if (this.isSuspendu) return 'fa-solid fa-triangle-exclamation text-red-500';
    if (this.isBloque) return 'fa-solid fa-ban text-slate-400';
    return 'fa-solid fa-clipboard-list text-primary';
  }

  /** Cercle d'icône (theme-aware via opacité). */
  get iconBgClass(): string {
    if (this.isEnAttente) return 'bg-orange-500/15';
    if (this.isSuspendu) return 'bg-red-500/15';
    if (this.isBloque) return 'bg-slate-500/15';
    return 'bg-primary/10';
  }

  /** Encadré d'info (theme-aware). */
  get cardBorderClass(): string {
    if (this.isEnAttente) return 'bg-orange-500/10 border-orange-500/25';
    if (this.isSuspendu) return 'bg-red-500/10 border-red-500/25';
    if (this.isBloque) return 'bg-slate-500/10 border-slate-500/25';
    return 'bg-primary/10 border-primary/20';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}