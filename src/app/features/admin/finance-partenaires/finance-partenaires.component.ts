import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { PartenaireSolde } from '../../../core/models/finance-partenaire.model';

/**
 * Vue rapide pour l'admin : combien la plateforme doit encore verser à
 * chaque vendeur (partenaire). Même solde que sur le dashboard finance du
 * vendeur (retombe à zéro dès qu'il est payé). Écran de consultation
 * uniquement — le paiement se fait depuis Finances > Demandes de paiement.
 */
@Component({
  selector: 'app-admin-finance-partenaires',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './finance-partenaires.component.html',
  styleUrls: ['./finance-partenaires.component.css']
})
export class AdminFinancePartenairesComponent implements OnInit {
  soldes: PartenaireSolde[] = [];
  loading = true;
  loadError = false;
  recherche = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.charger(); }

  charger(): void {
    this.loading = true;
    this.loadError = false;
    this.api.getSoldesPartenaires().subscribe({
      next: (data) => { this.soldes = data; this.loading = false; },
      error: () => { this.loadError = true; this.loading = false; }
    });
  }

  get filtres(): PartenaireSolde[] {
    const q = this.recherche.trim().toLowerCase();
    if (!q) { return this.soldes; }
    return this.soldes.filter(s =>
      `${s.prenom} ${s.nom}`.toLowerCase().includes(q) ||
      (s.nomBoutique || '').toLowerCase().includes(q) ||
      (s.telephone || '').includes(q)
    );
  }

  get totalAPayer(): number {
    return this.filtres.reduce((sum, s) => sum + (s.soldeAPayer || 0), 0);
  }
}
