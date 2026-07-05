import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { CommandeCloseur, StatutLivraison } from '../../../core/models/closing-dispatch.model';
import { STATUT_LABELS } from '../../../core/models/statut-labels';

type FiltreCloseur = 'TOUTES' | 'NOUVELLE' | 'A_APPELER' | 'CONFIRMEE' | 'PRETE_A_LIVRER';

@Component({
  selector: 'app-closeur-commandes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './commandes.component.html',
  styleUrls: ['./commandes.component.css']
})
export class CloseurCommandesComponent implements OnInit {
  commandes: CommandeCloseur[] = [];
  loading = true;
  loadError = false;
  actionEnCours: number | null = null;
  activeFiltre: FiltreCloseur = 'TOUTES';

  readonly statutLabels = STATUT_LABELS;

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private confirmation: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.loadError = false;
    const statut = this.activeFiltre === 'TOUTES' ? undefined : (this.activeFiltre as StatutLivraison);
    this.api.getCommandesCloseur(statut).subscribe({
      next: (data) => {
        this.commandes = data;
        this.loading = false;
      },
      error: () => {
        this.loadError = true;
        this.loading = false;
      }
    });
  }

  changerFiltre(filtre: FiltreCloseur): void {
    this.activeFiltre = filtre;
    this.charger();
  }

  appeler(c: CommandeCloseur): void {
    this.action(c.id, this.api.closeurAppeler(c.id), 'Commande prise en charge');
  }

  confirmer(c: CommandeCloseur): void {
    this.action(c.id, this.api.closeurConfirmer(c.id), 'Commande confirmée');
  }

  preteALivrer(c: CommandeCloseur): void {
    this.action(c.id, this.api.closeurPreteALivrer(c.id), 'Commande prête à livrer');
  }

  reporter(c: CommandeCloseur): void {
    this.confirmation.confirm({
      title: 'Relancer la commande',
      message: `Remettre ${c.numeroTracking} dans la file pour prise en charge ?`,
      confirmText: 'Relancer',
      cancelText: 'Annuler',
      type: 'info',
      input: { label: 'Note de relance (optionnel)', placeholder: 'Ex : client à rappeler cet après-midi' },
      onConfirm: (note) => this.action(c.id, this.api.closeurReporter(c.id, note),
        'Commande relancée : de nouveau disponible pour prise en charge')
    });
  }

  annuler(c: CommandeCloseur): void {
    this.confirmation.confirm({
      title: 'Annuler la commande',
      message: `Annuler définitivement la commande ${c.numeroTracking} ?`,
      confirmText: 'Annuler la commande',
      cancelText: 'Retour',
      type: 'danger',
      input: { label: 'Motif (optionnel)', placeholder: 'Ex : client injoignable, doublon...' },
      onConfirm: (motif) => this.action(c.id, this.api.closeurAnnuler(c.id, motif), 'Commande annulée')
    });
  }

  private action(id: number, obs: any, successMsg: string): void {
    this.actionEnCours = id;
    obs.subscribe({
      next: () => {
        this.toast.success(successMsg);
        this.actionEnCours = null;
        this.charger();
      },
      error: (err: any) => {
        this.toast.error(err?.error?.message || 'Action impossible');
        this.actionEnCours = null;
      }
    });
  }

  badgeClass(statut: StatutLivraison): string {
    switch (statut) {
      case 'NOUVELLE': return 'badge-pending';
      case 'A_APPELER': return 'badge-transit';
      case 'CONFIRMEE': return 'badge-picked';
      case 'PRETE_A_LIVRER': return 'badge-picked';
      default: return 'badge';
    }
  }
}
