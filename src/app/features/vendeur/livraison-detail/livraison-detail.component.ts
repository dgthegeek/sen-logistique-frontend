import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { LivraisonDetail, StatutLivraison } from '../../../core/models/livraison.model';
import { MOTIF_ECHEC_LABELS } from '../../../core/models/motif-echec-labels';

@Component({
  selector: 'app-livraison-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './livraison-detail.component.html',
  styleUrls: ['./livraison-detail.component.css']
})
export class LivraisonDetailComponent implements OnInit {
  livraison: LivraisonDetail | null = null;
  loading = true;
  errorMessage = '';
  readonly motifLabels = MOTIF_ECHEC_LABELS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadLivraison(+id);
    }
  }

  loadLivraison(id: number) {
    this.loading = true;
    this.apiService.getLivraisonById(id).subscribe({
      next: (livraison) => {
        this.livraison = livraison;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement livraison:', error);
        this.errorMessage = error.error?.message || 'Impossible de charger les détails de la livraison';
        this.loading = false;
      }
    });
  }

  getStatusBadgeClass(statut: StatutLivraison): string {
    const statusMap: { [key in StatutLivraison]: string } = {
      'NOUVELLE': 'badge-pending',
      'A_APPELER': 'badge-pending',
      'CONFIRMEE': 'badge-picked',
      'PRETE_A_LIVRER': 'badge-picked',
      'ASSIGNEE': 'badge-transit',
      'EN_LIVRAISON': 'badge-transit',
      'LIVREE': 'badge-delivered',
      'ECHEC': 'badge-failed',
      'ANNULEE': 'badge-canceled',
      'EN_ATTENTE_RAMASSAGE': 'badge-pending',
      'RAMASSE': 'badge-picked',
      'EN_ROUTE': 'badge-transit',
      'ECHEC_ABSENT': 'badge-failed',
      'ECHEC_REFUSE': 'badge-failed'
    };
    return `badge ${statusMap[statut]}`;
  }

  getStatusLabel(statut: StatutLivraison): string {
    const labels: { [key in StatutLivraison]: string } = {
      'NOUVELLE': 'Nouvelle commande',
      'A_APPELER': 'À appeler',
      'CONFIRMEE': 'Confirmée',
      'PRETE_A_LIVRER': 'Prête à livrer',
      'ASSIGNEE': 'Assignée à un livreur',
      'EN_LIVRAISON': 'En livraison',
      'LIVREE': 'Livré avec succès',
      'ECHEC': 'Échec de livraison',
      'ANNULEE': 'Annulé',
      'EN_ATTENTE_RAMASSAGE': 'En attente de ramassage',
      'RAMASSE': 'Ramassé',
      'EN_ROUTE': 'En route vers le client',
      'ECHEC_ABSENT': 'Échec - Client absent',
      'ECHEC_REFUSE': 'Échec - Colis refusé'
    };
    return labels[statut];
  }

  getStatusIcon(statut: StatutLivraison): string {
    const icons: { [key in StatutLivraison]: string } = {
      'NOUVELLE': '🆕',
      'A_APPELER': '📞',
      'CONFIRMEE': '✔️',
      'PRETE_A_LIVRER': '📦',
      'ASSIGNEE': '🧭',
      'EN_LIVRAISON': '🚚',
      'LIVREE': '✅',
      'ECHEC': '❌',
      'ANNULEE': '⛔',
      'EN_ATTENTE_RAMASSAGE': '⏳',
      'RAMASSE': '📦',
      'EN_ROUTE': '🚚',
      'ECHEC_ABSENT': '❌',
      'ECHEC_REFUSE': '🚫'
    };
    return icons[statut];
  }

  formatDate(date: string | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateShort(date: string | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  downloadQRCode() {
    if (this.livraison?.qrCodeUrl) {
      window.open(this.livraison.qrCodeUrl, '_blank');
    }
  }

  callClient() {
    if (this.livraison?.client.telephone) {
      window.location.href = `tel:${this.livraison.client.telephone}`;
    }
  }

  openMaps() {
    if (this.livraison) {
      const address = encodeURIComponent(
        `${this.livraison.client.adresse}, ${this.livraison.zone}, Sénégal`
      );
      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
    }
  }

  getProgressPercentage(): number {
    const steps = this.getTimelineSteps();
    const completedSteps = steps.filter(s => s.completed).length;
    return (completedSteps / steps.length) * 100;
  }

  /** Rang du statut dans le cycle Closing + Dispatch (pour l'avancement de la timeline). */
  private rangStatut(statut: string): number {
    const rangs: { [k: string]: number } = {
      'NOUVELLE': 0,
      'A_APPELER': 1,
      'CONFIRMEE': 2,
      'PRETE_A_LIVRER': 3,
      'ASSIGNEE': 4,
      'EN_LIVRAISON': 5,
      'LIVREE': 6,
      // Ancien cycle (dormant) : rattaché au nouveau pour rester cohérent
      'EN_ATTENTE_RAMASSAGE': 0,
      'RAMASSE': 3,
      'EN_ROUTE': 5
    };
    return rangs[statut] ?? 0;
  }

  getTimelineSteps() {
    if (!this.livraison) return [];

    const s = this.livraison.suivi;
    const rang = this.rangStatut(this.livraison.statut);

    const step = (label: string, seuil: number, date: string | null | undefined) => ({
      label,
      date: date ?? null,
      completed: rang >= seuil,
      active: rang === seuil
    });

    return [
      step('Commande créée', 0, this.livraison.dateCreation),
      step('Prise en charge', 1, s?.datePriseEnCharge),
      step('Confirmée', 2, s?.dateConfirmation),
      step('Prête à livrer', 3, s?.datePreteALivrer),
      step('Assignée au livreur', 4, s?.dateAssignation),
      step('En livraison', 5, null),
      step('Livrée', 6, this.livraison.dateLivraison ?? s?.dateLivraison)
    ];
  }
}