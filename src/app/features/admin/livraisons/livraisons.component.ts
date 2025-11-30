import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { LivraisonAdmin, LivraisonsAdminResponse } from '../../../core/models/admin.model';

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
  selectedLivraison: LivraisonAdmin | null = null;
  
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

  constructor(private apiService: ApiService) {}

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

  scanQRCode() {
    if (!this.searchQuery.trim()) {
      alert('Veuillez entrer un numéro de tracking');
      return;
    }

    this.loading = true;
    
    this.apiService.getLivraisonByNumero(this.searchQuery.trim()).subscribe({
      next: (livraison) => {
        this.selectedLivraison = livraison;
        this.cashCollecte = livraison.financier.montantCOD;
        this.closeScannerModal();
        this.showConfirmModal = true;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        alert(error.error?.message || 'Livraison non trouvée');
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
      if (!confirm('Le colis n\'a pas été remis. Confirmer quand même ?')) {
        return;
      }
    }

    this.submittingConfirmation = true;

    this.apiService.confirmerLivraison(this.selectedLivraison.numeroTracking, {
      cashCollecte: this.cashCollecte,
      colisRemis: this.colisRemis,
      commentaire: this.commentaire || undefined
    }).subscribe({
      next: (response) => {
        alert(response.message);
        this.closeConfirmModal();
        this.loadLivraisons();
        this.submittingConfirmation = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        alert(error.error?.message || 'Erreur lors de la confirmation');
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
      'RAMASSE': 'badge-picked',
      'EN_ROUTE': 'badge-transit',
      'LIVREE': 'badge-delivered',
      'ECHEC_ABSENT': 'badge-failed',
      'ECHEC_REFUSE': 'badge-failed'
    };
    return `badge ${classes[statut] || 'badge-pending'}`;
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