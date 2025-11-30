import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { LivraisonResume, LivraisonsResponse, StatutLivraison, LivraisonFilters } from '../../../core/models/livraison.model';

@Component({
  selector: 'app-livraisons',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './livraisons.component.html',
  styleUrls: ['./livraisons.component.css']
})
export class LivraisonsComponent implements OnInit {
  livraisons: LivraisonResume[] = [];
  loading = true;
  errorMessage = '';
  
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  
  selectedStatut: StatutLivraison | '' = '';
  searchQuery = '';
  
  statuts: { value: StatutLivraison | '', label: string }[] = [
    { value: '', label: 'Tous les statuts' },
    { value: 'EN_ATTENTE_RAMASSAGE', label: 'En attente' },
    { value: 'RAMASSE', label: 'Ramassé' },
    { value: 'EN_ROUTE', label: 'En route' },
    { value: 'LIVREE', label: 'Livré' },
    { value: 'ECHEC_ABSENT', label: 'Échec (Absent)' },
    { value: 'ECHEC_REFUSE', label: 'Échec (Refusé)' },
    { value: 'ANNULEE', label: 'Annulé' }
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadLivraisons();
  }

  loadLivraisons() {
    this.loading = true;
    this.errorMessage = '';
    
    const filters: LivraisonFilters = {};
    
    if (this.selectedStatut) {
      filters.statut = this.selectedStatut;
    }
    
    if (this.searchQuery.trim()) {
      filters.search = this.searchQuery.trim();
    }
    
    this.apiService.getMesLivraisons(this.currentPage, this.pageSize, filters).subscribe({
      next: (response) => {
        this.livraisons = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.page;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement livraisons:', error);
        this.errorMessage = 'Impossible de charger les livraisons';
        this.loading = false;
      }
    });
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadLivraisons();
  }

  onSearch() {
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

  goToPage(page: number) {
    this.currentPage = page;
    this.loadLivraisons();
  }

  getStatusBadgeClass(statut: StatutLivraison): string {
    const statusMap: {[key in StatutLivraison]: string} = {
      'EN_ATTENTE_RAMASSAGE': 'badge-pending',
      'RAMASSE': 'badge-picked',
      'EN_ROUTE': 'badge-transit',
      'LIVREE': 'badge-delivered',
      'ECHEC_ABSENT': 'badge-failed',
      'ECHEC_REFUSE': 'badge-failed',
      'ANNULEE': 'badge-canceled'
    };
    return `badge ${statusMap[statut]}`;
  }

  getStatusLabel(statut: StatutLivraison): string {
    const labels: {[key in StatutLivraison]: string} = {
      'EN_ATTENTE_RAMASSAGE': 'En attente',
      'RAMASSE': 'Ramassé',
      'EN_ROUTE': 'En route',
      'LIVREE': 'Livré',
      'ECHEC_ABSENT': 'Échec (Absent)',
      'ECHEC_REFUSE': 'Échec (Refusé)',
      'ANNULEE': 'Annulé'
    };
    return labels[statut];
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}