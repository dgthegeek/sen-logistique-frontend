import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ToastService } from '../../../core/services/toast.service';
import { LivraisonAdmin, LivraisonsAdminResponse } from '../../../core/models/admin.model';

@Component({
  selector: 'app-impression-qr',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent],
  templateUrl: './impression-qr.component.html',
  styleUrls: ['./impression-qr.component.css']
})
export class ImpressionQrComponent implements OnInit {
  livraisons: LivraisonAdmin[] = [];
  loading = true;
  errorMessage = '';
  
  // Filtres
  searchTerm = '';
  
  // Pagination
  currentPage = 0;
  pageSize = 50; // Plus grand car on peut sélectionner beaucoup
  totalElements = 0;
  totalPages = 0;
  
  // Sélection
  selectedLivraisons: Set<number> = new Set();
  
  // Actions
  generatingQR = false;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadLivraisons();
  }

  loadLivraisons() {
    this.loading = true;
    this.errorMessage = '';
    
    // Charger livraisons avec statut RAMASSE
    this.apiService.getLivraisonsAdmin(this.currentPage, this.pageSize, 'RAMASSE').subscribe({
      next: (data: LivraisonsAdminResponse) => {
        this.livraisons = data.content;
        this.currentPage = data.page;
        this.pageSize = data.size;
        this.totalElements = data.totalElements;
        this.totalPages = data.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement livraisons:', error);
        this.errorMessage = error.error?.message || 'Impossible de charger les livraisons';
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.currentPage = 0;
    this.loadLivraisons();
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadLivraisons();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadLivraisons();
    }
  }

  // ========== SÉLECTION ==========

  toggleLivraison(id: number) {
    if (this.selectedLivraisons.has(id)) {
      this.selectedLivraisons.delete(id);
    } else {
      this.selectedLivraisons.add(id);
    }
  }

  isLivraisonSelected(id: number): boolean {
    return this.selectedLivraisons.has(id);
  }

  selectAll() {
    if (this.selectedLivraisons.size === this.livraisons.length) {
      // Tout désélectionner
      this.selectedLivraisons.clear();
    } else {
      // Tout sélectionner
      this.livraisons.forEach(l => this.selectedLivraisons.add(l.id));
    }
  }

  get allSelected(): boolean {
    return this.livraisons.length > 0 && this.selectedLivraisons.size === this.livraisons.length;
  }

  // ========== IMPRESSION QR ==========

  imprimerQRCodes() {
    if (this.selectedLivraisons.size === 0) {
      this.toastService.warning('Veuillez sélectionner au moins une livraison');
      return;
    }

    this.generatingQR = true;

    this.apiService.imprimerQRCodes(Array.from(this.selectedLivraisons)).subscribe({
      next: (blob) => {
        // Télécharger le PDF
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-codes-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.toastService.success(`${this.selectedLivraisons.size} QR codes générés avec succès`);
        this.selectedLivraisons.clear();
        this.generatingQR = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.toastService.error('Erreur lors de la génération des QR codes');
        this.generatingQR = false;
      }
    });
  }

  // ========== HELPERS ==========

  getStatutBadgeClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'EN_ATTENTE_RAMASSAGE': 'badge-warning',
      'RAMASSE': 'badge-transit',
      'EN_TRANSIT': 'badge-transit',
      'EN_LIVRAISON': 'badge-transit',
      'LIVREE': 'badge-success',
      'ECHEC_LIVRAISON': 'badge-failed',
      'RETOURNEE': 'badge-warning'
    };
    return classes[statut] || 'badge-warning';
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE_RAMASSAGE': 'En attente',
      'RAMASSE': 'Ramassée',
      'EN_TRANSIT': 'En transit',
      'EN_LIVRAISON': 'En livraison',
      'LIVREE': 'Livrée',
      'ECHEC_LIVRAISON': 'Échec',
      'RETOURNEE': 'Retournée'
    };
    return labels[statut] || statut;
  }
}