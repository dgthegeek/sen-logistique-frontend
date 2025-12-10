import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { FcfaPipe } from '../../shared/pipes/fcfa.pipe';
import { DeliveryInfo, ConfirmLivraisonRequest } from '../../core/models/delivery.model';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationService } from '../../core/services/confirmation.service';

@Component({
  selector: 'app-delivery-confirm',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FcfaPipe],
  templateUrl: './delivery-confirm.component.html',
  styleUrls: ['./delivery-confirm.component.css']
})
export class DeliveryConfirmComponent implements OnInit {
  numeroTracking = '';
  delivery: DeliveryInfo | null = null;
  loading = true;
  errorMessage = '';
  
  cashCollecte = 0;
  colisRemis = true;
  commentaire = '';
  submitting = false;
  
  showSuccessModal = false;
  confirmationMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.numeroTracking = this.route.snapshot.params['numero'];
    this.loadDelivery();
  }

  loadDelivery() {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.getLivraisonByNumero(this.numeroTracking).subscribe({
      next: (data) => {
        this.delivery = data;
        this.cashCollecte = data.montantACollecter;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage = error.error?.message || 'Livraison introuvable';
        this.loading = false;
      }
    });
  }

  confirmerLivraison() {
    if (!this.delivery) return;

    // Validation montant
    if (this.cashCollecte < 0) {
      this.toastService.warning('Le montant collecté ne peut pas être négatif');
      return;
    }

    // ✅ Si colis pas remis, demander confirmation
    if (!this.colisRemis) {
      this.confirmationService.confirm({
        title: 'Colis non remis',
        message: 'Le colis n\'a pas été remis. Voulez-vous continuer quand même ?',
        confirmText: 'Continuer',
        cancelText: 'Annuler',
        type: 'warning',
        onConfirm: () => {
          this.executeConfirmation();
        }
      });
      return;
    }

    // ✅ Confirmation finale
    this.confirmationService.confirm({
      title: 'Confirmer la livraison',
      message: `Confirmer la livraison du colis ${this.delivery.numeroTracking} ?\n\nClient: ${this.delivery.client.nom}\nMontant: ${this.cashCollecte} FCFA`,
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      type: 'success',
      onConfirm: () => {
        this.executeConfirmation();
      }
    });
  }

  // ✅ Méthode séparée pour l'exécution
  executeConfirmation() {
    if (!this.delivery) return;

    this.submitting = true;

    const request: ConfirmLivraisonRequest = {
      cashCollecte: this.cashCollecte,
      colisRemis: this.colisRemis,
      commentaire: this.commentaire || undefined
    };

    this.apiService.confirmerLivraisonPublic(this.numeroTracking, request).subscribe({
      next: (response) => {
        this.confirmationMessage = response.message;
        this.showSuccessModal = true;
        this.submitting = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.toastService.error(error.error?.message || 'Erreur lors de la confirmation');
        this.submitting = false;
      }
    });
  }

  callClient() {
    if (this.delivery) {
      window.location.href = `tel:${this.delivery.client.telephone}`;
    }
  }

  openMaps() {
    if (this.delivery) {
      const address = encodeURIComponent(`${this.delivery.client.adresse}, Sénégal`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
    }
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    this.router.navigate(['/tracking', this.numeroTracking]);
  }
}