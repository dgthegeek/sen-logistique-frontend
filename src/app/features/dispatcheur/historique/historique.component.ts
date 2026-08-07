import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { LivraisonAdmin } from '../../../core/models/admin.model';
import { STATUT_LABELS } from '../../../core/models/statut-labels';
import { StatutLivraison } from '../../../core/models/closing-dispatch.model';

/**
 * Historique des commandes vu par le coordinateur logistique, filtrable par
 * statut et par date.
 */
@Component({
  selector: 'app-coordinateur-historique',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.css']
})
export class CoordinateurHistoriqueComponent implements OnInit {
  commandes: LivraisonAdmin[] = [];
  loading = true;
  loadError = false;

  selectedStatut = '';
  selectedDate = '';

  currentPage = 0;
  pageSize = 50;
  totalElements = 0;
  totalPages = 0;

  label(statut: string): string {
    return STATUT_LABELS[statut as StatutLivraison] || statut;
  }

  statuts = [
    { value: '', label: 'Tous les statuts' },
    { value: 'NOUVELLE', label: 'Nouvelle commande' },
    { value: 'A_APPELER', label: 'À appeler' },
    { value: 'CONFIRMEE', label: 'Confirmée' },
    { value: 'PRETE_A_LIVRER', label: 'Prête à livrer' },
    { value: 'ASSIGNEE', label: 'Assignée' },
    { value: 'EN_LIVRAISON', label: 'En livraison' },
    { value: 'LIVREE', label: 'Livrée' },
    { value: 'ECHEC', label: 'Échec' },
    { value: 'ANNULEE', label: 'Annulée' }
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.loadError = false;
    this.api.getCoordinateurHistorique(
      this.selectedStatut || undefined,
      this.selectedDate || undefined,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (res) => {
        this.commandes = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loadError = true;
        this.loading = false;
      }
    });
  }

  appliquerFiltres(): void {
    this.currentPage = 0;
    this.charger();
  }

  reinitialiser(): void {
    this.selectedStatut = '';
    this.selectedDate = '';
    this.currentPage = 0;
    this.charger();
  }

  pagePrecedente(): void {
    if (this.currentPage > 0) { this.currentPage--; this.charger(); }
  }

  pageSuivante(): void {
    if (this.currentPage < this.totalPages - 1) { this.currentPage++; this.charger(); }
  }

  badgeClass(statut: string): string {
    switch (statut) {
      case 'ASSIGNEE': return 'badge-pending';
      case 'EN_LIVRAISON': return 'badge-transit';
      case 'LIVREE': return 'badge-delivered';
      case 'ECHEC':
      case 'ANNULEE': return 'badge-failed';
      default: return 'badge-pending';
    }
  }
}
