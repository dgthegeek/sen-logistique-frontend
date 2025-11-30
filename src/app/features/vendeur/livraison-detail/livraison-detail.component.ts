import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { LivraisonDetail, StatutLivraison } from '../../../core/models/livraison.model';

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
      'EN_ATTENTE_RAMASSAGE': 'badge-pending',
      'RAMASSE': 'badge-picked',
      'EN_ROUTE': 'badge-transit',
      'LIVREE': 'badge-delivered',
      'ECHEC_ABSENT': 'badge-failed',
      'ECHEC_REFUSE': 'badge-failed',
      'ANNULEE': 'badge-canceled'
    };
    return `badge ${statusMap[statut]}`;
  }

  getStatusLabel(statut: StatutLivraison): string {
    const labels: { [key in StatutLivraison]: string } = {
      'EN_ATTENTE_RAMASSAGE': 'En attente de ramassage',
      'RAMASSE': 'Ramassé',
      'EN_ROUTE': 'En route vers le client',
      'LIVREE': 'Livré avec succès',
      'ECHEC_ABSENT': 'Échec - Client absent',
      'ECHEC_REFUSE': 'Échec - Colis refusé',
      'ANNULEE': 'Annulé'
    };
    return labels[statut];
  }

  getStatusIcon(statut: StatutLivraison): string {
    const icons: { [key in StatutLivraison]: string } = {
      'EN_ATTENTE_RAMASSAGE': '⏳',
      'RAMASSE': '📦',
      'EN_ROUTE': '🚚',
      'LIVREE': '✅',
      'ECHEC_ABSENT': '❌',
      'ECHEC_REFUSE': '🚫',
      'ANNULEE': '⛔'
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

  getTimelineSteps() {
    if (!this.livraison) return [];

    const steps = [
      {
        label: 'Livraison créée',
        date: this.livraison.dateCreation,
        completed: true,
        active: this.livraison.statut === 'EN_ATTENTE_RAMASSAGE'
      },
      {
        label: 'Colis ramassé',
        date: this.livraison.dateRamassage,
        completed: ['RAMASSE', 'EN_ROUTE', 'LIVREE'].includes(this.livraison.statut),
        active: this.livraison.statut === 'RAMASSE'
      },
      {
        label: 'En route',
        date: null,
        completed: ['EN_ROUTE', 'LIVREE'].includes(this.livraison.statut),
        active: this.livraison.statut === 'EN_ROUTE'
      },
      {
        label: 'Livré',
        date: this.livraison.dateLivraison,
        completed: this.livraison.statut === 'LIVREE',
        active: this.livraison.statut === 'LIVREE'
      }
    ];

    return steps;
  }
}