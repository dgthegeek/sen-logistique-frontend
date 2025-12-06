import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { FcfaPipe } from '../../shared/pipes/fcfa.pipe';
import { DeliveryInfo, ConfirmLivraisonRequest } from '../../core/models/delivery.model';

@Component({
  selector: 'app-delivery-confirm',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FcfaPipe],
  templateUrl: './delivery-confirm.component.html',
  styleUrls: ['./delivery-confirm.component.css']
})
export class DeliveryConfirmComponent implements OnInit {
  delivery: DeliveryInfo | null = null;
  loading = true;
  errorMessage = '';
  numeroTracking = '';
  
  // Form data
  cashCollecte = 0;
  colisRemis = true;
  commentaire = '';
  
  submitting = false;
  showSuccessModal = false;
  confirmationMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.numeroTracking = this.route.snapshot.paramMap.get('numero') || '';
    
    if (this.numeroTracking) {
      this.loadDeliveryInfo();
    } else {
      this.router.navigate(['/tracking']);
    }
  }

  loadDeliveryInfo() {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.getDeliveryInfo(this.numeroTracking).subscribe({
      next: (data) => {
        this.delivery = data;
        this.cashCollecte = data.montantACollecter;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage = error.error?.message || 'Livraison introuvable ou déjà confirmée';
        this.loading = false;
      }
    });
  }

  confirmerLivraison() {
    if (!this.delivery) return;

    // Validation
    if (this.cashCollecte < 0) {
      alert('Le montant collecté ne peut pas être négatif');
      return;
    }

    if (!this.colisRemis) {
      if (!confirm('Le colis n\'a pas été remis. Voulez-vous continuer ?')) {
        return;
      }
    }

    // Confirmation finale
    const message = `Confirmer la livraison ?\n\n` +
                   `Colis: ${this.delivery.numeroTracking}\n` +
                   `Client: ${this.delivery.client.nom}\n` +
                   `Cash collecté: ${this.cashCollecte} FCFA\n` +
                   `Colis remis: ${this.colisRemis ? 'Oui' : 'Non'}`;

    if (!confirm(message)) return;

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
        alert(error.error?.message || 'Erreur lors de la confirmation');
        this.submitting = false;
      }
    });
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    this.router.navigate(['/tracking', this.numeroTracking]);
  }

  callClient() {
    if (this.delivery?.client.telephone) {
      window.location.href = `tel:${this.delivery.client.telephone}`;
    }
  }

  openMaps() {
    if (this.delivery) {
      const address = encodeURIComponent(`${this.delivery.client.adresse}, Dakar, Sénégal`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
    }
  }
}