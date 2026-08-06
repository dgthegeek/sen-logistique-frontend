import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { CreateLivraisonRequest, CreateLivraisonResponse } from '../../../core/models/livraison.model';

/**
 * Création d'une commande par le coordinateur logistique, pour le compte d'un
 * vendeur (identifié par son numéro de téléphone). La commande entre dans la
 * file du closeur (statut NOUVELLE), comme une création admin/vendeur.
 */
@Component({
  selector: 'app-coordinateur-creer-commande',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './creer-commande.component.html',
  styleUrls: ['./creer-commande.component.css']
})
export class CoordinateurCreerCommandeComponent {
  form: CreateLivraisonRequest = this.vide();
  loading = false;
  cree: CreateLivraisonResponse | null = null;

  constructor(private api: ApiService, private toast: ToastService) {}

  private vide(): CreateLivraisonRequest {
    return {
      telephoneVendeur: '',
      nomClient: '',
      telephoneClient: '',
      adresseComplete: '',
      pointRepere: '',
      descriptionProduit: '',
      fragile: false,
      montantCOD: 0,
      urgence: 'NORMAL'
    };
  }

  soumettre(): void {
    if (!this.form.telephoneVendeur) {
      this.toast.warning('Le téléphone du vendeur est requis');
      return;
    }
    if (!this.form.nomClient || !this.form.telephoneClient || !this.form.adresseComplete
        || !this.form.descriptionProduit || !this.form.montantCOD) {
      this.toast.warning('Merci de remplir tous les champs obligatoires');
      return;
    }

    this.loading = true;
    this.api.coordinateurCreerCommande(this.form).subscribe({
      next: (res) => {
        this.cree = res;
        this.loading = false;
        this.toast.success('Commande créée ! Elle est dans la file du closeur (à appeler).');
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err?.error?.message || 'Erreur lors de la création de la commande');
      }
    });
  }

  nouvelle(): void {
    this.form = this.vide();
    this.cree = null;
  }
}
