import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { CommandeLivreur, StatutLivraison } from '../../../core/models/closing-dispatch.model';
import { STATUT_LABELS } from '../../../core/models/statut-labels';

/** Historique complet des livraisons du livreur connecté (tous statuts, filtrable). */
@Component({
  selector: 'app-livreur-historique',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.css']
})
export class LivreurHistoriqueComponent implements OnInit {
  livraisons: CommandeLivreur[] = [];
  loading = true;
  loadError = false;
  selectedStatut = '';

  statuts = [
    { value: '', label: 'Toutes' },
    { value: 'ASSIGNEE', label: 'Assignée' },
    { value: 'EN_LIVRAISON', label: 'En livraison' },
    { value: 'LIVREE', label: 'Livrée' },
    { value: 'ECHEC', label: 'Échec' }
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.loadError = false;
    const statut = this.selectedStatut ? (this.selectedStatut as StatutLivraison) : undefined;
    this.api.getLivreurHistorique(statut).subscribe({
      next: (data) => { this.livraisons = data; this.loading = false; },
      error: () => { this.loadError = true; this.loading = false; }
    });
  }

  label(statut: string): string {
    return STATUT_LABELS[statut as StatutLivraison] || statut;
  }

  badgeClass(statut: string): string {
    switch (statut) {
      case 'ASSIGNEE': return 'badge-pending';
      case 'EN_LIVRAISON': return 'badge-transit';
      case 'LIVREE': return 'badge-delivered';
      case 'ECHEC': return 'badge-failed';
      default: return 'badge-pending';
    }
  }
}
