import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import {
  Produit, CreateProduitRequest, UpdateProduitRequest, MouvementStockRequest, AjustementStockRequest, Mouvement
} from '../../../core/models/stock.model';
import { VendeurDTO } from '../../../core/models/vendeur.model';

@Component({
  selector: 'app-admin-stock',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class AdminStockComponent implements OnInit {
  produits: Produit[] = [];
  vendeurs: VendeurDTO[] = [];
  loading = true;
  loadError = false;
  saving = false;
  search = '';
  filtreVendeurId: number | null = null;

  currentPage = 0;
  pageSize = 50;
  totalPages = 0;
  totalElements = 0;

  // Modal création
  showCreateModal = false;
  newProduit: CreateProduitRequest = this.produitVide();

  // Modal entrée stock / ajustement
  showStockModal = false;
  stockMode: 'entree' | 'ajuster' = 'entree';
  produitCible: Produit | null = null;
  quantite: number | null = null;
  commentaire = '';

  // Modal mouvements
  showMouvementsModal = false;
  mouvements: Mouvement[] = [];
  loadingMouvements = false;

  // Modal édition produit (nom, description, prix, seuil)
  showEditModal = false;
  editProduit: Produit | null = null;
  editForm: { nom: string; description: string; prixUnitaire: number | null; seuilAlerte: number | null } =
    { nom: '', description: '', prixUnitaire: null, seuilAlerte: null };

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.charger();
    this.chargerVendeurs();
  }

  charger(): void {
    this.loading = true;
    this.loadError = false;
    this.api.getProduits(this.search || undefined, this.filtreVendeurId || undefined, this.currentPage, this.pageSize).subscribe({
      next: (p) => {
        this.produits = p.content;
        this.totalPages = p.totalPages;
        this.totalElements = p.totalElements;
        this.loading = false;
      },
      error: () => { this.loadError = true; this.loading = false; }
    });
  }

  chargerVendeurs(): void {
    this.api.getVendeurs(undefined, 0, 200).subscribe({
      next: (p) => this.vendeurs = p.content,
      error: () => {}
    });
  }

  rechercher(): void {
    this.currentPage = 0;
    this.charger();
  }

  filtrerParPartenaire(): void {
    this.currentPage = 0;
    this.charger();
  }

  // ---- Création ----
  ouvrirCreate(): void {
    this.newProduit = this.produitVide();
    this.showCreateModal = true;
  }

  fermerCreate(): void { this.showCreateModal = false; }

  creer(): void {
    if (!this.newProduit.nom || !this.newProduit.vendeurId) {
      this.toast.warning('Le nom et le partenaire sont obligatoires');
      return;
    }
    this.saving = true;
    this.api.createProduit(this.newProduit).subscribe({
      next: () => {
        this.toast.success('Produit créé');
        this.saving = false;
        this.fermerCreate();
        this.charger();
      },
      error: (err) => { this.toast.error(err?.error?.message || 'Création impossible'); this.saving = false; }
    });
  }

  // ---- Entrée / Ajustement ----
  ouvrirStock(produit: Produit, mode: 'entree' | 'ajuster'): void {
    this.produitCible = produit;
    this.stockMode = mode;
    this.quantite = mode === 'ajuster' ? produit.quantiteStock : null;
    this.commentaire = '';
    this.showStockModal = true;
  }

  fermerStock(): void { this.showStockModal = false; this.produitCible = null; }

  validerStock(): void {
    if (!this.produitCible || this.quantite == null || this.quantite < 0) {
      this.toast.warning('Quantité invalide');
      return;
    }
    this.saving = true;
    const obs = this.stockMode === 'entree'
      ? this.api.entreeStock(this.produitCible.id, { quantite: this.quantite, commentaire: this.commentaire } as MouvementStockRequest)
      : this.api.ajusterStock(this.produitCible.id, { quantite: this.quantite, commentaire: this.commentaire } as AjustementStockRequest);

    obs.subscribe({
      next: () => {
        this.toast.success(this.stockMode === 'entree' ? 'Entrée enregistrée' : 'Stock ajusté');
        this.saving = false;
        this.fermerStock();
        this.charger();
      },
      error: (err) => { this.toast.error(err?.error?.message || 'Opération impossible'); this.saving = false; }
    });
  }

  // ---- Mouvements ----
  voirMouvements(produit: Produit): void {
    this.produitCible = produit;
    this.showMouvementsModal = true;
    this.loadingMouvements = true;
    this.api.getMouvements(produit.id).subscribe({
      next: (m) => { this.mouvements = m; this.loadingMouvements = false; },
      error: () => { this.mouvements = []; this.loadingMouvements = false; }
    });
  }

  fermerMouvements(): void { this.showMouvementsModal = false; this.mouvements = []; }

  // ---- Édition produit (prix modifiable à tout moment) ----
  ouvrirEdit(produit: Produit): void {
    this.editProduit = produit;
    this.editForm = {
      nom: produit.nom,
      description: produit.description ?? '',
      prixUnitaire: produit.prixUnitaire ?? null,
      seuilAlerte: produit.seuilAlerte ?? null
    };
    this.showEditModal = true;
  }

  fermerEdit(): void { this.showEditModal = false; this.editProduit = null; }

  enregistrerEdit(): void {
    if (!this.editProduit) { return; }
    if (this.editForm.prixUnitaire == null || this.editForm.prixUnitaire < 0) {
      this.toast.warning('Prix invalide');
      return;
    }
    this.saving = true;
    const data: UpdateProduitRequest = {
      nom: this.editForm.nom,
      description: this.editForm.description,
      prixUnitaire: this.editForm.prixUnitaire ?? undefined,
      seuilAlerte: this.editForm.seuilAlerte ?? undefined
    };
    this.api.updateProduit(this.editProduit.id, data).subscribe({
      next: (p) => {
        // Mettre à jour la ligne localement
        if (this.editProduit) {
          this.editProduit.nom = p.nom;
          this.editProduit.description = p.description;
          this.editProduit.prixUnitaire = p.prixUnitaire;
          this.editProduit.seuilAlerte = p.seuilAlerte;
        }
        this.toast.success('Produit mis à jour');
        this.saving = false;
        this.fermerEdit();
      },
      error: (err) => { this.toast.error(err?.error?.message || 'Modification impossible'); this.saving = false; }
    });
  }

  toggleActif(produit: Produit): void {
    this.api.updateProduit(produit.id, { actif: !produit.actif }).subscribe({
      next: (p) => { produit.actif = p.actif; this.toast.success(p.actif ? 'Produit activé' : 'Produit désactivé'); },
      error: (err) => this.toast.error(err?.error?.message || 'Action impossible')
    });
  }

  pagePrecedente(): void { if (this.currentPage > 0) { this.currentPage--; this.charger(); } }
  pageSuivante(): void { if (this.currentPage < this.totalPages - 1) { this.currentPage++; this.charger(); } }

  private produitVide(): CreateProduitRequest {
    return { nom: '', description: '', vendeurId: 0, prixUnitaire: undefined, quantiteInitiale: 0, seuilAlerte: 5 };
  }
}
