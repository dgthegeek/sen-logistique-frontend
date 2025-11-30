import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { VendeurFinances } from '../../../core/models/finance.model';

@Component({
  selector: 'app-finances',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './finances.component.html',
  styleUrls: ['./finances.component.css']
})
export class FinancesComponent implements OnInit {
  finances: VendeurFinances | null = null;
  loading = true;
  errorMessage = '';
  
  showDemandeModal = false;
  submittingDemande = false;
  demandeSuccess = false;
  demandeMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadFinances();
  }

  loadFinances() {
    this.loading = true;
    this.errorMessage = '';
    
    this.apiService.getVendeurFinances().subscribe({
      next: (finances) => {
        this.finances = finances;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement finances:', error);
        this.errorMessage = error.error?.message || 'Impossible de charger les finances';
        this.loading = false;
      }
    });
  }

  openDemandeModal() {
    this.showDemandeModal = true;
    this.demandeSuccess = false;
    this.demandeMessage = '';
  }

  closeDemandeModal() {
    this.showDemandeModal = false;
  }

  submitDemandePaiement() {
    this.submittingDemande = true;
    this.demandeMessage = '';

    this.apiService.demanderPaiement({}).subscribe({
      next: (response) => {
        this.demandeSuccess = true;
        this.demandeMessage = response.message;
        this.submittingDemande = false;
        
        setTimeout(() => {
          this.loadFinances();
          this.closeDemandeModal();
        }, 2000);
      },
      error: (error) => {
        console.error('Erreur demande paiement:', error);
        this.demandeSuccess = false;
        this.demandeMessage = error.error?.message || 'Impossible de créer la demande de paiement';
        this.submittingDemande = false;
      }
    });
  }

  getStatutBadgeClass(statut: string): string {
    const classes: {[key: string]: string} = {
      'EFFECTUE': 'badge-delivered',
      'EN_ATTENTE': 'badge-pending',
      'ANNULE': 'badge-canceled'
    };
    return `badge ${classes[statut] || 'badge-pending'}`;
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
}