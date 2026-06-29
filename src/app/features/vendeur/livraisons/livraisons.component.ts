import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { LivraisonResume, LivraisonsResponse, StatutLivraison, LivraisonFilters } from '../../../core/models/livraison.model';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

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
    { value: 'NOUVELLE', label: 'Nouvelle commande' },
    { value: 'A_APPELER', label: 'À appeler' },
    { value: 'CONFIRMEE', label: 'Confirmée' },
    { value: 'PRETE_A_LIVRER', label: 'Prête à livrer' },
    { value: 'ASSIGNEE', label: 'Assignée' },
    { value: 'EN_LIVRAISON', label: 'En livraison' },
    { value: 'LIVREE', label: 'Livrée' },
    { value: 'ECHEC', label: 'Échec' },
    { value: 'ANNULEE', label: 'Annulée' }
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
      'NOUVELLE': 'badge-pending',
      'A_APPELER': 'badge-pending',
      'CONFIRMEE': 'badge-picked',
      'PRETE_A_LIVRER': 'badge-picked',
      'ASSIGNEE': 'badge-transit',
      'EN_LIVRAISON': 'badge-transit',
      'LIVREE': 'badge-delivered',
      'ECHEC': 'badge-failed',
      'ANNULEE': 'badge-canceled',
      'EN_ATTENTE_RAMASSAGE': 'badge-pending',
      'RAMASSE': 'badge-picked',
      'EN_ROUTE': 'badge-transit',
      'ECHEC_ABSENT': 'badge-failed',
      'ECHEC_REFUSE': 'badge-failed'
    };
    return `badge ${statusMap[statut]}`;
  }

  getStatusLabel(statut: StatutLivraison): string {
    const labels: {[key in StatutLivraison]: string} = {
      'NOUVELLE': 'Nouvelle commande',
      'A_APPELER': 'À appeler',
      'CONFIRMEE': 'Confirmée',
      'PRETE_A_LIVRER': 'Prête à livrer',
      'ASSIGNEE': 'Assignée',
      'EN_LIVRAISON': 'En livraison',
      'LIVREE': 'Livrée',
      'ECHEC': 'Échec',
      'ANNULEE': 'Annulée',
      'EN_ATTENTE_RAMASSAGE': 'En attente de ramassage',
      'RAMASSE': 'Ramassé',
      'EN_ROUTE': 'En route',
      'ECHEC_ABSENT': 'Échec (Absent)',
      'ECHEC_REFUSE': 'Échec (Refusé)'
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

  exporterExcel(): void {
  if (this.livraisons.length === 0) {
    this.errorMessage = 'Aucune donnée à exporter';
    setTimeout(() => this.errorMessage = '', 3000);
    return;
  }

  const exportData = this.livraisons.map(livraison => ({
    'Numéro Tracking': livraison.numeroTracking,
    'Statut': this.getStatusLabel(livraison.statut),
    'Date Création': this.formatDateForExcel(livraison.dateCreation),
    'Montant COD': livraison.montantCOD,
    'Frais Livraison': livraison.fraisLivraison,
    'Montant à Recevoir': livraison.montantARecevoir
  }));

  // Créer le worksheet
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

  // Ajuster la largeur des colonnes
  const columnWidths = [
    { wch: 20 }, // Numéro Tracking
    { wch: 20 }, // Statut
    { wch: 18 }, // Date Création
    { wch: 12 }, // Montant COD
    { wch: 12 }, // Frais Livraison
    { wch: 15 }, // Montant à Recevoir
  ];
  worksheet['!cols'] = columnWidths;

  // Créer le workbook
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Mes Livraisons': worksheet },
    SheetNames: ['Mes Livraisons']
  };

  // Générer le fichier
  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Sauvegarder
  const data: Blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });
  
  const fileName = `mes_livraisons_${this.formatDateForFile(new Date())}.xlsx`;
  FileSaver.saveAs(data, fileName);

  // Message de succès temporaire
  const originalError = this.errorMessage;
  this.errorMessage = `✅ ${this.livraisons.length} livraison(s) exportée(s) avec succès`;
  setTimeout(() => {
    this.errorMessage = originalError;
  }, 3000);
}

private formatDateForExcel(date: string): string {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

private formatDateForFile(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}${month}${day}_${hours}${minutes}`;
}

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}