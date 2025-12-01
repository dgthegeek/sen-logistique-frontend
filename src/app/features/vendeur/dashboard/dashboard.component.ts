import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { VendeurDashboard, LivraisonResume, StatutLivraison } from '../../../core/models/dashboard.model';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { MockDashboardService } from '../../../core/services/mock-dashboard.service';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dashboard: VendeurDashboard | null = null;
  loading = true;
  errorMessage = '';

  constructor(
    private apiService: ApiService,
    private mockDashboard: MockDashboardService 
  ) {}

  ngOnInit() {
    this.loadDashboard();
  }

  // Quand le backend sera prêt
  loadDashboard() {
    this.loading = true;
    this.apiService.getVendeurDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement dashboard:', error);
        this.errorMessage = 'Impossible de charger le dashboard';
        this.loading = false;
      }
    });
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}