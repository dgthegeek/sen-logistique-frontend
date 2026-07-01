import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { AdminFinancesDashboard, PaiementsPending, DemandePaiementPending, TransactionAdmin, TransactionsResponse } from '../../../core/models/admin.model';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';

@Component({
  selector: 'app-admin-finances',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './finances.component.html',
  styleUrls: ['./finances.component.css']
})
export class AdminFinancesComponent implements OnInit {
  dashboard: AdminFinancesDashboard | null = null;
  paiementsPending: PaiementsPending | null = null;
  transactions: TransactionAdmin[] = [];

  loading = true;
  loadingTransactions = false;
  errorMessage = '';

  // Période dashboard
  selectedPeriode: 'jour' | 'semaine' | 'mois' | 'tout' = 'jour';
  periodes = [
    { value: 'jour', label: 'Aujourd\'hui' },
    { value: 'semaine', label: 'Cette semaine' },
    { value: 'mois', label: 'Ce mois' },
    { value: 'tout', label: 'Tout' }
  ];

  // Pagination transactions
  currentPage = 0;
  pageSize = 50;
  totalElements = 0;
  totalPages = 0;

  // Filtres transactions
  selectedVendeurId: number | null = null;
  dateDebut = '';
  dateFin = '';

  // Modal paiement
  showPayerModal = false;
  selectedDemande: DemandePaiementPending | null = null;
  montantAPayer = 0;
  commentairePaiement = '';
  submittingPaiement = false;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit() {
    this.loadFinances();
  }

  loadFinances() {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      dashboard: this.apiService.getAdminFinancesDashboard(this.selectedPeriode),
      paiementsPending: this.apiService.getPaiementsPending()
    }).subscribe({
      next: (data) => {
        this.dashboard = data.dashboard;
        this.paiementsPending = data.paiementsPending;
        this.loading = false;
        this.loadTransactions();
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage = error.error?.message || 'Impossible de charger les finances';
        this.loading = false;
      }
    });
  }

  onPeriodeChange() {
    console.log('📅 Période changée:', this.selectedPeriode);
    this.loadFinances();
  }

  loadTransactions() {
    this.loadingTransactions = true;

    this.apiService.getTransactionsAdmin(
      this.selectedVendeurId || undefined,
      this.dateDebut || undefined,
      this.dateFin || undefined,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response) => {
        this.transactions = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.page;
        this.loadingTransactions = false;
      },
      error: (error) => {
        console.error('Erreur transactions:', error);
        this.loadingTransactions = false;
      }
    });
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadTransactions();
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadTransactions();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadTransactions();
    }
  }

  openPayerModal(demande: DemandePaiementPending) {
    this.selectedDemande = demande;
    this.montantAPayer = demande.montant;
    this.commentairePaiement = '';
    this.showPayerModal = true;
  }

  closePayerModal() {
    this.showPayerModal = false;
    this.selectedDemande = null;
    this.montantAPayer = 0;
    this.commentairePaiement = '';
  }

  payerVendeur() {
    if (!this.selectedDemande) return;

    if (this.selectedDemande.montant <= 0) {
      this.toastService.warning('Aucun solde à payer pour ce vendeur');
      return;
    }

    // L'admin solde la totalité du disponible : le solde du vendeur est remis à 0 et tracé.
    this.confirmationService.confirm({
      title: 'Confirmer le paiement',
      message: `Solder ${this.selectedDemande.montant.toLocaleString('fr-FR')} FCFA à ${this.selectedDemande.vendeur.prenom} ${this.selectedDemande.vendeur.nom} ? Son solde disponible sera remis à zéro.`,
      confirmText: 'Solder',
      cancelText: 'Annuler',
      type: 'success',
      onConfirm: () => {
        this.executePayerVendeur();
      }
    });
  }

  // ✅ Séparer la logique d'exécution
  executePayerVendeur() {
    if (!this.selectedDemande) return;

    this.submittingPaiement = true;

    this.apiService.payerVendeur(this.selectedDemande.vendeur.id, {
      montant: this.selectedDemande.montant,
      commentaire: this.commentairePaiement || undefined
    }).subscribe({
      next: (response) => {
        this.toastService.success(`${response.message}\nRéférence: ${response.reference}`);
        this.closePayerModal();
        this.loadFinances();
        this.submittingPaiement = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.toastService.error(error.error?.message || 'Erreur lors du paiement');
        this.submittingPaiement = false;
      }
    });
  }

  callVendeur(telephone: string) {
    window.location.href = `tel:${telephone}`;
  }

  getStatutBadgeClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'EFFECTUE': 'badge-delivered',
      'EN_ATTENTE': 'badge-pending',
      'ANNULE': 'badge-canceled'
    };
    return `badge ${classes[statut] || 'badge-pending'}`;
  }

  getTypeBadgeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'PAIEMENT_VENDEUR': 'badge-delivered',
      'LIVRAISON': 'badge-transit',
      'COMMISSION': 'badge-pending'
    };
    return `badge ${classes[type] || 'badge-pending'}`;
  }

  getPeriodeLabel(): string {
    const labels: { [key: string]: string } = {
      'jour': 'aujourd\'hui',
      'semaine': 'cette semaine',
      'mois': 'ce mois',
      'tout': 'tout'
    };
    return labels[this.selectedPeriode] || '';
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

  formatDateShort(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}