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
import { LivraisonDetail } from '../../../core/models/livraison.model';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

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

  showDetailModal = false;
  livraison: LivraisonDetail | null = null;

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
    { value: 'NOUVELLE', label: 'Nouvelle commande' },
    { value: 'A_APPELER', label: 'À appeler' },
    { value: 'CONFIRMEE', label: 'Confirmée' },
    { value: 'PRETE_A_LIVRER', label: 'Prête à livrer' },
    { value: 'ASSIGNEE', label: 'Assignée' },
    { value: 'EN_LIVRAISON', label: 'En livraison' },
    { value: 'LIVREE', label: 'Livrée' },
    { value: 'ECHEC', label: 'Échec' },
    { value: 'ANNULEE', label: 'Annulée' },
  ];

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

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
    const classes: { [key: string]: string } = {
      'NOUVELLE': 'badge-pending',
      'A_APPELER': 'badge-pending',
      'CONFIRMEE': 'badge-picked',
      'PRETE_A_LIVRER': 'badge-picked',
      'ASSIGNEE': 'badge-transit',
      'EN_LIVRAISON': 'badge-transit',
      'LIVREE': 'badge-delivered',
      'ECHEC': 'badge-failed',
      'ANNULEE': 'badge-canceled',
      // Ancien cycle (dormant)
      'EN_ATTENTE_RAMASSAGE': 'badge-pending',
      'RAMASSE': 'badge-picked',
      'EN_ROUTE': 'badge-transit',
      'ECHEC_ABSENT': 'badge-failed',
      'ECHEC_REFUSE': 'badge-failed'
    };
    return `badge ${classes[statut] || 'badge-pending'}`;
  }

  getStatusLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'NOUVELLE': 'Nouvelle commande',
      'A_APPELER': 'À appeler',
      'CONFIRMEE': 'Confirmée',
      'PRETE_A_LIVRER': 'Prête à livrer',
      'ASSIGNEE': 'Assignée',
      'EN_LIVRAISON': 'En livraison',
      'LIVREE': 'Livrée',
      'ECHEC': 'Échec',
      'ANNULEE': 'Annulée',
      // Ancien cycle (dormant)
      'EN_ATTENTE_RAMASSAGE': 'En attente de ramassage',
      'RAMASSE': 'Ramassé',
      'EN_ROUTE': 'En route',
      'ECHEC_ABSENT': 'Échec (Absent)',
      'ECHEC_REFUSE': 'Échec (Refusé)'
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

  // Ajouter ces méthodes
  openDetailModal(id: number) {
    this.loadLivraison(id);
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.livraison = null;
  }

  // ===== Contrôle qualité (traçabilité) =====

  nomActeur(p?: { nom: string; prenom: string } | null): string {
    return p ? `${p.prenom} ${p.nom}` : '—';
  }

  formatDateHeure(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  formatDuree(min?: number | null): string {
    if (min == null) return '—';
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}h ${m}min` : `${h}h`;
  }

  get etapesSuivi() {
    const s = this.livraison?.suivi;
    if (!s) return [];
    return [
      { label: 'Commande créée', icon: 'fa-plus', date: s.dateCreation, acteur: null, dureeLabel: '', duree: null, color: 'text-blue-500' },
      { label: 'Prise en charge', icon: 'fa-clipboard-check', date: s.datePriseEnCharge, acteur: this.nomActeur(s.closeur), dureeLabel: 'délai', duree: s.minutesPriseEnCharge, color: 'text-indigo-500' },
      { label: 'Confirmée', icon: 'fa-check', date: s.dateConfirmation, acteur: this.nomActeur(s.closeur), dureeLabel: '', duree: null, color: 'text-emerald-500' },
      { label: 'Prête à livrer', icon: 'fa-box-open', date: s.datePreteALivrer, acteur: this.nomActeur(s.closeur), dureeLabel: 'closing', duree: s.minutesClosing, color: 'text-teal-500' },
      { label: 'Assignée (dispatch)', icon: 'fa-truck-arrow-right', date: s.dateAssignation, acteur: this.nomActeur(s.dispatcheur), dureeLabel: 'dispatch', duree: s.minutesDispatch, color: 'text-orange-500' },
      { label: 'Livrée', icon: 'fa-circle-check', date: s.dateLivraison, acteur: this.livraison?.livreur ? this.nomActeur(this.livraison.livreur) : '—', dureeLabel: 'livraison', duree: s.minutesLivraison, color: 'text-green-600' },
    ].filter(e => e.date);
  }

  loadLivraison(id: number) {
    this.loading = true;
    this.apiService.getLivraisonById(id).subscribe({
      next: (livraison) => {
        this.livraison = livraison;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement livraison:', error);
        this.errorMessage = error.error?.message || 'Impossible de charger les détails de la livraison';
        this.loading = false;
        this.closeDetailModal();
        this.toastService.error(this.errorMessage);
      }
    });
  }

  exporterExcel(): void {
  if (this.livraisons.length === 0) {
    this.toastService.warning('Aucune donnée à exporter');
    return;
  }

  const exportData = this.livraisons.map(livraison => ({
    'Numéro Tracking': livraison.numeroTracking,
    'Statut': this.getStatusLabel(livraison.statut),
    'Date Création': this.formatDateForExcel(livraison.dateCreation),
    
    // Financier
    'Montant COD': livraison.montantCOD,
    'Frais Livraison': livraison.fraisLivraison,
    'Vendeur Reçoit': livraison.montantARecevoir,
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
    { wch: 15 }, // Vendeur Reçoit
  ];
  worksheet['!cols'] = columnWidths;

  // Créer le workbook
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Livraisons': worksheet },
    SheetNames: ['Livraisons']
  };

  // Générer le fichier
  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Sauvegarder
  const data: Blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });
  
  const fileName = `livraisons_${this.formatDateForFile(new Date())}.xlsx`;
  FileSaver.saveAs(data, fileName);

  this.toastService.success(`${this.livraisons.length} livraison(s) exportée(s) avec succès`);
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
}