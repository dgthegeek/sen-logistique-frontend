import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { Produit, CreateMonProduitRequest } from '../../../core/models/stock.model';

interface ProduitForm {
  nom: string;
  description: string;
  prixUnitaire: number | null;
  quantiteInitiale: number;
  seuilAlerte: number;
}

@Component({
  selector: 'app-vendeur-mon-stock',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './mon-stock.component.html',
  styleUrls: ['./mon-stock.component.css']
})
export class VendeurMonStockComponent implements OnInit {
  produits: Produit[] = [];
  loading = true;
  loadError = false;

  showModal = false;
  saving = false;
  editId: number | null = null;
  form: ProduitForm = this.formVide();

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.loadError = false;
    this.api.getMesProduits().subscribe({
      next: (data) => { this.produits = data; this.loading = false; },
      error: () => { this.loadError = true; this.loading = false; }
    });
  }

  get isEdition(): boolean {
    return this.editId !== null;
  }

  ouvrirCreate(): void {
    this.editId = null;
    this.form = this.formVide();
    this.showModal = true;
  }

  ouvrirEdit(p: Produit): void {
    this.editId = p.id;
    this.form = {
      nom: p.nom,
      description: p.description || '',
      prixUnitaire: p.prixUnitaire ?? null,
      quantiteInitiale: p.quantiteStock,
      seuilAlerte: p.seuilAlerte
    };
    this.showModal = true;
  }

  fermerModal(): void {
    this.showModal = false;
    this.editId = null;
  }

  enregistrer(): void {
    if (!this.form.nom) {
      this.toast.warning('Le nom du produit est obligatoire');
      return;
    }
    this.saving = true;
    if (this.isEdition) {
      this.api.modifierMonProduit(this.editId!, {
        nom: this.form.nom,
        description: this.form.description || undefined,
        prixUnitaire: this.form.prixUnitaire ?? undefined,
        seuilAlerte: this.form.seuilAlerte
      }).subscribe({
        next: () => this.apresEnregistrement('Produit mis à jour'),
        error: (err) => this.erreur(err)
      });
    } else {
      const data: CreateMonProduitRequest = {
        nom: this.form.nom,
        description: this.form.description || undefined,
        prixUnitaire: this.form.prixUnitaire ?? undefined,
        quantiteInitiale: this.form.quantiteInitiale,
        seuilAlerte: this.form.seuilAlerte
      };
      this.api.creerMonProduit(data).subscribe({
        next: () => this.apresEnregistrement('Produit créé'),
        error: (err) => this.erreur(err)
      });
    }
  }

  private apresEnregistrement(msg: string): void {
    this.toast.success(msg);
    this.saving = false;
    this.fermerModal();
    this.charger();
  }

  private erreur(err: any): void {
    this.toast.error(err?.error?.message || 'Opération impossible');
    this.saving = false;
  }

  private formVide(): ProduitForm {
    return { nom: '', description: '', prixUnitaire: null, quantiteInitiale: 0, seuilAlerte: 5 };
  }
}
