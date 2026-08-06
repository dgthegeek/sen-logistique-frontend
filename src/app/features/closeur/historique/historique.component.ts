import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { CommandeCloseur, StatutLivraison } from '../../../core/models/closing-dispatch.model';
import { STATUT_LABELS } from '../../../core/models/statut-labels';

/** Historique des commandes prises en charge par le closeur connecté. */
@Component({
  selector: 'app-closeur-historique',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.css']
})
export class CloseurHistoriqueComponent implements OnInit {
  commandes: CommandeCloseur[] = [];
  loading = true;
  loadError = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.loadError = false;
    this.api.getCloseurHistorique().subscribe({
      next: (data) => { this.commandes = data; this.loading = false; },
      error: () => { this.loadError = true; this.loading = false; }
    });
  }

  label(statut: string): string {
    return STATUT_LABELS[statut as StatutLivraison] || statut;
  }

  badgeClass(statut: string): string {
    switch (statut) {
      case 'CONFIRMEE':
      case 'PRETE_A_LIVRER': return 'badge-pending';
      case 'EN_LIVRAISON':
      case 'ASSIGNEE': return 'badge-transit';
      case 'LIVREE': return 'badge-delivered';
      case 'ECHEC':
      case 'ANNULEE': return 'badge-failed';
      default: return 'badge-pending';
    }
  }
}
