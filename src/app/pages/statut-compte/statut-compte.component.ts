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
    if (this.isEnAttente) return '⏳';
    if (this.isSuspendu) return '🚫';
    if (this.isBloque) return '⛔';
    return '📋';
  }

  get bgClass(): string {
    if (this.isEnAttente) return 'from-orange-50 via-background to-orange-100';
    if (this.isSuspendu) return 'from-red-50 via-background to-red-100';
    if (this.isBloque) return 'from-gray-50 via-background to-gray-100';
    return 'from-blue-50 via-background to-blue-100';
  }

  get iconBgClass(): string {
    if (this.isEnAttente) return 'bg-orange-100';
    if (this.isSuspendu) return 'bg-red-100';
    if (this.isBloque) return 'bg-gray-100';
    return 'bg-blue-100';
  }

  get cardBorderClass(): string {
    if (this.isEnAttente) return 'bg-orange-50 border-orange-200';
    if (this.isSuspendu) return 'bg-red-50 border-red-200';
    if (this.isBloque) return 'bg-gray-50 border-gray-200';
    return 'bg-blue-50 border-blue-200';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}