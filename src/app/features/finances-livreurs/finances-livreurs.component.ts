import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../shared/pipes/fcfa.pipe';
import { LivreurSolde, VersementLivreur } from '../../core/models/finance-livreur.model';
import { Observable } from 'rxjs';

/**
 * Finance des livreurs : cash (COD) collecté que chaque livreur doit reverser
 * au coordinateur logistique / à l'admin.
 *
 * <p>Composant partagé entre le coordinateur (`/dispatcheur/finances`) et l'admin
 * (`/admin/finances-livreurs`) : les appels API sont choisis selon le rôle.
 */
@Component({
  selector: 'app-finances-livreurs',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './finances-livreurs.component.html',
  styleUrls: ['./finances-livreurs.component.css']
})
export class FinancesLivreursComponent implements OnInit {
  soldes: LivreurSolde[] = [];
  versements: VersementLivreur[] = [];
  loading = true;
  loadError = false;
  versementEnCours: number | null = null;

  // Onglet actif
  ongletHistorique = false;

  // Modal de versement
  showVerserModal = false;
  cible: LivreurSolde | null = null;
  commentaire = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private toast: ToastService
  ) {}

  private get admin(): boolean {
    return this.auth.isAdmin();
  }

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.loadError = false;
    const soldes$: Observable<LivreurSolde[]> = this.admin
      ? this.api.getAdminSoldesLivreurs()
      : this.api.getCoordinateurSoldesLivreurs();
    soldes$.subscribe({
      next: (data) => {
        this.soldes = data;
        this.loading = false;
      },
      error: () => {
        this.loadError = true;
        this.loading = false;
      }
    });
  }

  chargerHistorique(): void {
    const versements$ = this.admin
      ? this.api.getAdminVersements(0, 100)
      : this.api.getCoordinateurVersements(0, 100);
    versements$.subscribe({
      next: (page) => { this.versements = page.content; },
      error: () => { this.toast.error('Impossible de charger l\'historique des versements'); }
    });
  }

  basculerOnglet(historique: boolean): void {
    this.ongletHistorique = historique;
    if (historique && this.versements.length === 0) {
      this.chargerHistorique();
    }
  }

  get totalARegler(): number {
    return this.soldes.reduce((s, l) => s + (l.soldeARegler || 0), 0);
  }

  // ---- Versement ----
  ouvrirVerser(l: LivreurSolde): void {
    if (!l.soldeARegler || l.soldeARegler <= 0) {
      this.toast.info('Ce livreur n\'a aucun montant à verser.');
      return;
    }
    this.cible = l;
    this.commentaire = '';
    this.showVerserModal = true;
  }

  fermerVerser(): void {
    this.showVerserModal = false;
    this.cible = null;
  }

  confirmerVerser(): void {
    if (!this.cible) { return; }
    const l = this.cible;
    this.versementEnCours = l.livreurId;
    const verser$ = this.admin
      ? this.api.adminVerserLivreur(l.livreurId, this.commentaire || undefined)
      : this.api.coordinateurVerserLivreur(l.livreurId, this.commentaire || undefined);
    verser$.subscribe({
      next: (v) => {
        this.toast.success(`Versement de ${v.montant.toLocaleString('fr-FR')} FCFA enregistré pour ${l.prenom} ${l.nom}. Solde remis à zéro.`);
        this.versementEnCours = null;
        this.fermerVerser();
        this.versements = [];
        this.charger();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Versement impossible');
        this.versementEnCours = null;
      }
    });
  }
}
