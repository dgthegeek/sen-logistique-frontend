import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../shared/pipes/fcfa.pipe';
import { LivraisonDetail } from '../../core/models/livraison.model';
import { STATUT_LABELS } from '../../core/models/statut-labels';
import { MOTIF_ECHEC_LABELS } from '../../core/models/motif-echec-labels';

/**
 * Détail d'une commande partagé par le staff (closeur, dispatcheur, livreur, admin),
 * avec la traçabilité qualité (qui a fait quoi et en combien de temps).
 */
@Component({
  selector: 'app-commande-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './commande-detail.component.html',
  styleUrls: ['./commande-detail.component.css']
})
export class CommandeDetailComponent implements OnInit {
  livraison: LivraisonDetail | null = null;
  loading = true;
  errorMessage = '';
  readonly statutLabels = STATUT_LABELS;
  readonly motifLabels = MOTIF_ECHEC_LABELS;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getCommandeDetail(id).subscribe({
      next: (d) => { this.livraison = d; this.loading = false; },
      error: (err) => { this.errorMessage = err?.error?.message || 'Commande introuvable'; this.loading = false; }
    });
  }

  retour(): void { this.location.back(); }

  nom(p?: { nom: string; prenom: string } | null): string {
    return p ? `${p.prenom} ${p.nom}` : '—';
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  formatDuree(min?: number | null): string {
    if (min == null) return '—';
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}h ${m}min` : `${h}h`;
  }

  /** Étapes de la traçabilité, dans l'ordre. */
  get etapes() {
    const s = this.livraison?.suivi;
    if (!s) return [];
    return [
      { label: 'Commande créée', icon: 'fa-plus', date: s.dateCreation, acteur: null, duree: null, color: 'text-blue-500' },
      { label: 'Prise en charge', icon: 'fa-clipboard-check', date: s.datePriseEnCharge, acteur: this.nom(s.closeur), dureeLabel: 'délai', duree: s.minutesPriseEnCharge, color: 'text-indigo-500' },
      { label: 'Confirmée', icon: 'fa-check', date: s.dateConfirmation, acteur: this.nom(s.closeur), duree: null, color: 'text-emerald-500' },
      { label: 'Prête à livrer', icon: 'fa-box-open', date: s.datePreteALivrer, acteur: this.nom(s.closeur), dureeLabel: 'closing', duree: s.minutesClosing, color: 'text-teal-500' },
      { label: 'Assignée (dispatch)', icon: 'fa-truck-arrow-right', date: s.dateAssignation, acteur: this.nom(s.dispatcheur), dureeLabel: 'dispatch', duree: s.minutesDispatch, color: 'text-orange-500' },
      { label: 'Livrée', icon: 'fa-circle-check', date: s.dateLivraison, acteur: this.livraison?.livreur ? this.nom(this.livraison.livreur) : '—', dureeLabel: 'livraison', duree: s.minutesLivraison, color: 'text-green-600' },
    ].filter(e => e.date);
  }
}
