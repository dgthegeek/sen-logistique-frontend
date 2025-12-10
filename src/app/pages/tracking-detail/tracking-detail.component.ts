import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { FcfaPipe } from '../../shared/pipes/fcfa.pipe';
import { TrackingInfo, TimelineStep } from '../../core/models/tracking.model';
import { AuthHeaderComponent } from "../../shared/components/auth-header/auth-header.component";

@Component({
  selector: 'app-tracking-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FcfaPipe, AuthHeaderComponent],
  templateUrl: './tracking-detail.component.html',
  styleUrls: ['./tracking-detail.component.css']
})
export class TrackingDetailComponent implements OnInit {
  tracking: TrackingInfo | null = null;
  loading = true;
  errorMessage = '';
  numeroTracking = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    this.numeroTracking = this.route.snapshot.paramMap.get('numero') || '';

    if (this.numeroTracking) {
      this.loadTracking();
    } else {
      this.router.navigate(['/tracking']);
    }
  }

  loadTracking() {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.getTrackingInfo(this.numeroTracking).subscribe({
      next: (data) => {
        this.tracking = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage = error.error?.message || 'Numéro de tracking invalide ou colis introuvable';
        this.loading = false;
      }
    });
  }

  getStatusIcon(statut: string): string {
    const icons: { [key: string]: string } = {
      'EN_ATTENTE_RAMASSAGE': '⏳',
      'RAMASSE': '📦',
      'EN_ROUTE': '🚚',
      'LIVREE': '✅',
      'ECHEC_ABSENT': '❌',
      'ECHEC_REFUSE': '🚫',
      'ANNULEE': '⛔'
    };
    return icons[statut] || '📦';
  }

  getStatusLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE_RAMASSAGE': 'En attente de ramassage',
      'RAMASSE': 'Colis ramassé',
      'EN_ROUTE': 'En cours de livraison',
      'LIVREE': 'Livré avec succès',
      'ECHEC_ABSENT': 'Échec - Client absent',
      'ECHEC_REFUSE': 'Échec - Colis refusé',
      'ANNULEE': 'Commande annulée'
    };
    return labels[statut] || statut;
  }

  getStatusColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'EN_ATTENTE_RAMASSAGE': 'text-orange-600 bg-orange-50 border-orange-200',
      'RAMASSE': 'text-blue-600 bg-blue-50 border-blue-200',
      'EN_ROUTE': 'text-purple-600 bg-purple-50 border-purple-200',
      'LIVREE': 'text-green-600 bg-green-50 border-green-200',
      'ECHEC_ABSENT': 'text-red-600 bg-red-50 border-red-200',
      'ECHEC_REFUSE': 'text-red-600 bg-red-50 border-red-200',
      'ANNULEE': 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[statut] || 'text-gray-600 bg-gray-50 border-gray-200';
  }

  getEtapeLabel(etape: string): string {
    const labels: { [key: string]: string } = {
      'COMMANDE_CREEE': 'Commande créée',
      'COLIS_RECUPERE': 'Colis récupéré',
      'EN_COURS_LIVRAISON': 'En cours de livraison',
      'LIVRE': 'Livré'
    };
    return labels[etape] || etape;
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  retrySearch() {
    this.router.navigate(['/tracking']);
  }

  isLastCompletedStep(step: any, index: number): boolean {
    const completedSteps = this.tracking?.timeline.filter(s => s.effectue);
    if (completedSteps) {
      return step.effectue && index === completedSteps.length - 1;
    }
    return false;
  }
}