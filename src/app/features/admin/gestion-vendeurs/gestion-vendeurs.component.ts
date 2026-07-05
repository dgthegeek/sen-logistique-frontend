import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { 
  VendeurDTO, 
  VendeurDetailDTO, 
  StatutVendeur, 
  VendeurFilters,
  AdminVendeursEnAttenteResponse
} from '../../../core/models/vendeur.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-gestion-vendeurs',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './gestion-vendeurs.component.html',
  styleUrls: ['./gestion-vendeurs.component.css']
})
export class GestionVendeursComponent implements OnInit {
  vendeurs: VendeurDTO[] = [];
  vendeursEnAttente: VendeurDTO[] = [];
  nombreEnAttente = 0;
  
  loading = true;
  errorMessage = '';
  
  // Pagination
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;
  
  // Tabs
  activeTab: 'en-attente' | 'tous' | 'actifs' | 'suspendus' = 'en-attente';
  
  // Filtres
  filters: VendeurFilters = {
    statut: undefined,
    commune: '',
    quartier: '',
    search: '',
    sort: 'dateInscription',
    order: 'desc'
  };
  
  // Modal détail
  showDetailModal = false;
  selectedVendeur: VendeurDetailDTO | null = null;
  loadingDetail = false;
  
  // Modal action
  showActionModal = false;
  actionType: 'valider' | 'suspendre' | 'bloquer' | 'reactiver' = 'valider';
  raisonAction = '';
  commissionAction: number | null = null;
  submittingAction = false;

  // Modal commission (modifier la commission d'un vendeur déjà validé)
  showCommissionModal = false;
  commissionVendeur: VendeurDetailDTO | null = null;
  commissionValue: number | null = null;
  submittingCommission = false;
  
  StatutVendeur = StatutVendeur;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadVendeursEnAttente();
    this.loadVendeurs();
  }

  loadVendeursEnAttente() {
    this.apiService.getVendeursEnAttente().subscribe({
      next: (response) => {
        this.vendeursEnAttente = response.vendeurs;
        this.nombreEnAttente = response.total;
      },
      error: (error) => {
        console.error('Erreur:', error);
      }
    });
  }

  loadVendeurs() {
    this.loading = true;
    
    // Appliquer le filtre de statut selon l'onglet actif
    const filters = { ...this.filters };
    
    if (this.activeTab === 'en-attente') {
      filters.statut = StatutVendeur.EN_ATTENTE_VALIDATION;
    } else if (this.activeTab === 'actifs') {
      filters.statut = StatutVendeur.ACTIF;
    } else if (this.activeTab === 'suspendus') {
      filters.statut = StatutVendeur.SUSPENDU;
    }
    
    this.apiService.getVendeurs(filters, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.vendeurs = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.page;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage = 'Impossible de charger les vendeurs';
        this.loading = false;
      }
    });
  }

  changeTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
    this.currentPage = 0;
    this.filters = {
      statut: undefined,
      commune: '',
      quartier: '',
      search: '',
      sort: 'dateInscription',
      order: 'desc'
    };
    this.loadVendeurs();
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadVendeurs();
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadVendeurs();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadVendeurs();
    }
  }

  openDetailModal(vendeur: VendeurDTO) {
    this.showDetailModal = true;
    this.loadingDetail = true;
    this.selectedVendeur = null;
    
    this.apiService.getVendeurDetail(vendeur.id).subscribe({
      next: (detail) => {
        this.selectedVendeur = detail;
        this.loadingDetail = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.toastService.error('Impossible de charger les détails');
        this.closeDetailModal();
      }
    });
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedVendeur = null;
  }

  openActionModal(vendeur: VendeurDTO, action: typeof this.actionType) {
    this.selectedVendeur = vendeur as any; // Cast temporaire
    this.actionType = action;
    this.raisonAction = '';
    this.commissionAction = vendeur.commissionFixe ?? null;
    this.showActionModal = true;
  }

  closeActionModal() {
    this.showActionModal = false;
    this.selectedVendeur = null;
    this.raisonAction = '';
    this.commissionAction = null;
  }

  openCommissionModal(vendeur: VendeurDetailDTO) {
    this.commissionVendeur = vendeur;
    this.commissionValue = vendeur.commissionFixe ?? null;
    this.showCommissionModal = true;
  }

  closeCommissionModal() {
    this.showCommissionModal = false;
    this.commissionVendeur = null;
    this.commissionValue = null;
  }

  saveCommission() {
    if (!this.commissionVendeur) return;
    if (this.commissionValue == null || this.commissionValue <= 0) {
      this.toastService.warning('Veuillez indiquer une commission valide');
      return;
    }
    this.submittingCommission = true;
    this.apiService.setCommissionVendeur(this.commissionVendeur.id, this.commissionValue).subscribe({
      next: (vendeur) => {
        this.toastService.success('Commission mise à jour');
        if (this.selectedVendeur && this.selectedVendeur.id === vendeur.id) {
          this.selectedVendeur.commissionFixe = vendeur.commissionFixe;
        }
        this.closeCommissionModal();
        this.loadVendeurs();
        this.submittingCommission = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.toastService.error(error.error?.message || 'Erreur lors de la mise à jour');
        this.submittingCommission = false;
      }
    });
  }

  executeAction() {
    if (!this.selectedVendeur) return;

    if ((this.actionType === 'suspendre' || this.actionType === 'bloquer') && !this.raisonAction.trim()) {
      this.toastService.warning('Veuillez indiquer une raison');
      return;
    }

    if (this.actionType === 'valider' && (this.commissionAction == null || this.commissionAction <= 0)) {
      this.toastService.warning('Veuillez indiquer la commission (prix de livraison) du vendeur');
      return;
    }

    this.submittingAction = true;
    let action$;

    switch (this.actionType) {
      case 'valider':
        action$ = this.apiService.validerVendeur(this.selectedVendeur.id, this.commissionAction!);
        break;
      case 'suspendre':
        action$ = this.apiService.suspendreVendeur(this.selectedVendeur.id, { raison: this.raisonAction });
        break;
      case 'bloquer':
        action$ = this.apiService.bloquerVendeur(this.selectedVendeur.id, { raison: this.raisonAction });
        break;
      case 'reactiver':
        action$ = this.apiService.reactiverVendeur(this.selectedVendeur.id);
        break;
    }

    action$.subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.closeActionModal();
        this.loadVendeursEnAttente();
        this.loadVendeurs();
        this.submittingAction = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.toastService.error(error.error?.message || 'Erreur lors de l\'action');
        this.submittingAction = false;
      }
    });
  }

  callVendeur(telephone: string) {
    window.location.href = `tel:${telephone}`;
  }

  getStatutBadgeClass(statut: StatutVendeur): string {
    const classes: {[key in StatutVendeur]: string} = {
      [StatutVendeur.EN_ATTENTE_VALIDATION]: 'badge-pending',
      [StatutVendeur.ACTIF]: 'badge-delivered',
      [StatutVendeur.SUSPENDU]: 'badge-failed',
      [StatutVendeur.BLOQUE]: 'badge-canceled'
    };
    return `badge ${classes[statut]}`;
  }

  getStatutLabel(statut: StatutVendeur): string {
    const labels: {[key in StatutVendeur]: string} = {
      [StatutVendeur.EN_ATTENTE_VALIDATION]: 'En attente',
      [StatutVendeur.ACTIF]: 'Actif',
      [StatutVendeur.SUSPENDU]: 'Suspendu',
      [StatutVendeur.BLOQUE]: 'Bloqué'
    };
    return labels[statut];
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}