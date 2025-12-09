import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { DeliveryInfo } from '../../../core/models/delivery.model'; // ← NOUVEAU
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { LivraisonAdmin } from '../../../core/models/admin.model';

@Component({
  selector: 'app-admin-livraisons',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './livraisons.component.html',
  styleUrls: ['./livraisons.component.css']
})
export class AdminLivraisonsComponent implements OnInit {
  livraisons: LivraisonAdmin[] = [];
  loading = true;
  errorMessage = '';
  
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;
  
  selectedStatut = '';
  searchQuery = '';
  
  showScannerModal = false;
  showConfirmModal = false;
  selectedLivraison: DeliveryInfo | null = null; // ← CHANGÉ LE TYPE
  
  cashCollecte = 0;
  colisRemis = true;
  commentaire = '';
  submittingConfirmation = false;
  
  statuts = [
    { value: '', label: 'Tous les statuts' },
    { value: 'RAMASSE', label: 'Ramassé' },
    { value: 'EN_ROUTE', label: 'En route' },
    { value: 'LIVREE', label: 'Livré' },
    { value: 'ECHEC_ABSENT', label: 'Échec (Absent)' },
    { value: 'ECHEC_REFUSE', label: 'Échec (Refusé)' }
  ];

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadLivraisons();
  }

  loadLivraisons() {
    this.loading = true;
    this.errorMessage = '';
    
    this.apiService.getLivraisonsAdmin(
      this.currentPage,
      this.pageSize,
      this.selectedStatut || undefined
    ).subscribe({
      next: (response) => {
        this.livraisons = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.page;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage = 'Impossible de charger les livraisons';
        this.loading = false;
      }
    });
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadLivraisons();
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadLivraisons();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadLivraisons();
    }
  }

  openScannerModal() {
    this.showScannerModal = true;
  }

  closeScannerModal() {
    this.showScannerModal = false;
    this.searchQuery = '';
  }

  openScannerModalWithTracking(tracking: string) {
    this.searchQuery = tracking;
    this.scanQRCode();
  }

  scanQRCode() {
    if (!this.searchQuery.trim()) {
      this.toastService.warning('Veuillez entrer un numéro de tracking');
      return;
    }

    this.loading = true;
    
    this.apiService.getLivraisonByNumero(this.searchQuery.trim()).subscribe({
      next: (livraison: DeliveryInfo) => {
        console.log('📦 Livraison récupérée:', livraison);
        this.selectedLivraison = livraison;
        this.cashCollecte = livraison.montantACollecter;
        this.closeScannerModal();
        this.showConfirmModal = true;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.toastService.error(error.error?.message || 'Livraison non trouvée');
        this.loading = false;
      }
    });
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
    this.selectedLivraison = null;
    this.cashCollecte = 0;
    this.colisRemis = true;
    this.commentaire = '';
  }

  confirmerLivraison() {
    if (!this.selectedLivraison) return;

    if (!this.colisRemis) {
      this.confirmationService.confirm({
        title: 'Colis non remis',
        message: 'Le colis n\'a pas été remis. Confirmer quand même ?',
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        type: 'warning',
        onConfirm: () => {
          this.executeConfirmerLivraison();
        }
      });
      return;
    }

    this.executeConfirmerLivraison();
  }

  executeConfirmerLivraison() {
    if (!this.selectedLivraison) return;

    this.submittingConfirmation = true;

    this.apiService.confirmerLivraison(this.selectedLivraison.numeroTracking, {
      cashCollecte: this.cashCollecte,
      colisRemis: this.colisRemis,
      commentaire: this.commentaire || undefined
    }).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.closeConfirmModal();
        this.loadLivraisons();
        this.submittingConfirmation = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.toastService.error(error.error?.message || 'Erreur lors de la confirmation');
        this.submittingConfirmation = false;
      }
    });
  }

  callClient(telephone: string) {
    window.location.href = `tel:${telephone}`;
  }

  openMaps(adresse: string, commune: string) {
    const fullAddress = encodeURIComponent(`${adresse}, ${commune}, Sénégal`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${fullAddress}`, '_blank');
  }

  getStatusBadgeClass(statut: string): string {
    const classes: {[key: string]: string} = {
      'EN_ATTENTE_RAMASSAGE': 'badge-pending',
      'RAMASSE': 'badge-picked',
      'EN_ROUTE': 'badge-transit',
      'LIVREE': 'badge-delivered',
      'ECHEC_ABSENT': 'badge-failed',
      'ECHEC_REFUSE': 'badge-failed'
    };
    return `badge ${classes[statut] || 'badge-pending'}`;
  }

  getStatusLabel(statut: string): string {
    const labels: {[key: string]: string} = {
      'EN_ATTENTE_RAMASSAGE': 'En attente',
      'RAMASSE': 'Ramassé',
      'EN_ROUTE': 'En route',
      'LIVREE': 'Livré',
      'ECHEC_ABSENT': 'Échec (Absent)',
      'ECHEC_REFUSE': 'Échec (Refusé)',
      'ANNULEE': 'Annulé'
    };
    return labels[statut] || statut;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}