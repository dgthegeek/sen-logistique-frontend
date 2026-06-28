import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { DashboardStats } from '../../../core/models/closing-dispatch.model';

interface CarteStatut {
  label: string;
  valeur: number;
  icon: string;
  classe: string;
}

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class AdminStatsComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.api.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Impossible de charger les statistiques');
        this.loading = false;
      }
    });
  }

  get cartes(): CarteStatut[] {
    const c = this.stats?.commandes;
    if (!c) { return []; }
    return [
      { label: 'À appeler', valeur: c.aAppeler, icon: 'fa-phone', classe: 'text-amber-600' },
      { label: 'Confirmées', valeur: c.confirmees, icon: 'fa-check', classe: 'text-blue-600' },
      { label: 'Prêtes à livrer', valeur: c.pretesALivrer, icon: 'fa-box-open', classe: 'text-indigo-600' },
      { label: 'Assignées', valeur: c.assignees, icon: 'fa-user-check', classe: 'text-cyan-600' },
      { label: 'En livraison', valeur: c.enLivraison, icon: 'fa-truck', classe: 'text-orange-600' },
      { label: 'Livrées', valeur: c.livrees, icon: 'fa-circle-check', classe: 'text-green-600' },
      { label: 'Échecs', valeur: c.echecs, icon: 'fa-triangle-exclamation', classe: 'text-red-600' },
    ];
  }

  formatTemps(minutes: number): string {
    if (!minutes) { return '—'; }
    if (minutes < 60) { return `${minutes} min`; }
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }
}
