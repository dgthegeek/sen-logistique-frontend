import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { AdminDashboard, AdminFinancesDashboard, RamassagesToday, LivraisonsALivrer, PaiementsPending } from '../../../core/models/admin.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  dashboard: AdminDashboard | null = null;
  loading = true;
  errorMessage = '';
  
  private refreshSubscription?: Subscription;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadDashboard();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }

  loadDashboard() {
    this.loading = true;
    this.errorMessage = '';

    // Appeler les 4 endpoints en parallèle
    forkJoin({
      finances: this.apiService.getAdminFinancesDashboard('jour'),
      ramassages: this.apiService.getRamassagesTodayDashboard(),
      livraisons: this.apiService.getLivraisonsALivrer(),
      paiements: this.apiService.getPaiementsPending()
    }).subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
        console.log('✅ Dashboard admin chargé:', data);
      },
      error: (error) => {
        console.error('❌ Erreur chargement dashboard:', error);
        this.errorMessage = 'Impossible de charger le dashboard';
        this.loading = false;
      }
    });
  }

  startAutoRefresh() {
    // Rafraîchir toutes les 30 secondes
    this.refreshSubscription = interval(30000)
      .pipe(startWith(0))
      .subscribe(() => {
        if (!this.loading) {
          this.loadDashboard();
        }
      });
  }

  stopAutoRefresh() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  getTauxReussiteClass(): string {
    if (!this.dashboard?.finances.statistiques.tauxReussite) return '';
    const taux = this.dashboard.finances.statistiques.tauxReussite;
    
    if (taux >= 90) return 'text-green-600';
    if (taux >= 75) return 'text-orange-600';
    return 'text-red-600';
  }

  formatTauxReussite(): string {
    if (!this.dashboard?.finances.statistiques.tauxReussite) return '0%';
    return `${this.dashboard.finances.statistiques.tauxReussite.toFixed(1)}%`;
  }
}