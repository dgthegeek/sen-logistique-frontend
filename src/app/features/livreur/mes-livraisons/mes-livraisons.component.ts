import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { CommandeLivreur, MotifEchec, StatutLivraison } from '../../../core/models/closing-dispatch.model';
import { STATUT_LABELS } from '../../../core/models/statut-labels';

@Component({
  selector: 'app-livreur-mes-livraisons',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './mes-livraisons.component.html',
  styleUrls: ['./mes-livraisons.component.css']
})
export class LivreurMesLivraisonsComponent implements OnInit {
  livraisons: CommandeLivreur[] = [];
  loading = true;
  actionEnCours: number | null = null;

  readonly statutLabels = STATUT_LABELS;

  // Modal "livrer"
  showLivrerModal = false;
  livrerCible: CommandeLivreur | null = null;
  cashCollecte: number | null = null;
  commentaireLivraison = '';

  // Modal "échec"
  showEchecModal = false;
  echecCible: CommandeLivreur | null = null;
  motifEchec: MotifEchec | null = null;
  commentaireEchec = '';

  readonly motifs: { value: MotifEchec; label: string }[] = [
    { value: 'TELEPHONE_INJOIGNABLE', label: 'Téléphone injoignable' },
    { value: 'CLIENT_ABSENT', label: 'Client absent' },
    { value: 'ADRESSE_INCORRECTE', label: 'Adresse incorrecte' },
    { value: 'REFUS_CLIENT', label: 'Refus client' },
    { value: 'REPORT_CLIENT', label: 'Report client' }
  ];

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.api.getMesLivraisonsLivreur().subscribe({
      next: (data) => {
        this.livraisons = data;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Impossible de charger vos livraisons');
        this.loading = false;
      }
    });
  }

  commencer(l: CommandeLivreur): void {
    this.actionEnCours = l.id;
    this.api.livreurCommencer(l.id).subscribe({
      next: () => {
        this.toast.success('Livraison démarrée');
        this.actionEnCours = null;
        this.charger();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Action impossible');
        this.actionEnCours = null;
      }
    });
  }

  // ---- Modal livrer ----
  ouvrirLivrer(l: CommandeLivreur): void {
    this.livrerCible = l;
    this.cashCollecte = l.montantAEncaisser;
    this.commentaireLivraison = '';
    this.showLivrerModal = true;
  }

  fermerLivrer(): void {
    this.showLivrerModal = false;
    this.livrerCible = null;
  }

  confirmerLivrer(): void {
    if (!this.livrerCible) { return; }
    if (this.cashCollecte == null || this.cashCollecte < 0) {
      this.toast.warning('Montant encaissé invalide');
      return;
    }
    this.actionEnCours = this.livrerCible.id;
    this.api.livreurLivrer(this.livrerCible.id, {
      cashCollecte: this.cashCollecte,
      commentaire: this.commentaireLivraison || undefined
    }).subscribe({
      next: () => {
        this.toast.success('Livraison effectuée ✅');
        this.actionEnCours = null;
        this.fermerLivrer();
        this.charger();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Action impossible');
        this.actionEnCours = null;
      }
    });
  }

  // ---- Modal échec ----
  ouvrirEchec(l: CommandeLivreur): void {
    this.echecCible = l;
    this.motifEchec = null;
    this.commentaireEchec = '';
    this.showEchecModal = true;
  }

  fermerEchec(): void {
    this.showEchecModal = false;
    this.echecCible = null;
  }

  confirmerEchec(): void {
    if (!this.echecCible) { return; }
    if (!this.motifEchec) {
      this.toast.warning('Sélectionnez un motif');
      return;
    }
    this.actionEnCours = this.echecCible.id;
    this.api.livreurEchec(this.echecCible.id, {
      motif: this.motifEchec,
      commentaire: this.commentaireEchec || undefined
    }).subscribe({
      next: () => {
        this.toast.success('Échec enregistré');
        this.actionEnCours = null;
        this.fermerEchec();
        this.charger();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Action impossible');
        this.actionEnCours = null;
      }
    });
  }

  badgeClass(statut: StatutLivraison): string {
    switch (statut) {
      case 'ASSIGNEE': return 'badge-pending';
      case 'EN_LIVRAISON': return 'badge-transit';
      case 'LIVREE': return 'badge-delivered';
      case 'ECHEC': return 'badge-failed';
      default: return 'badge';
    }
  }
}
