import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { PerformanceResponse } from '../../../core/models/performance.model';

/**
 * Contrôle qualité : performances de l'équipe (closeurs, dispatcheurs, livreurs).
 */
@Component({
  selector: 'app-admin-performance',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent],
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.css']
})
export class AdminPerformanceComponent implements OnInit {
  data: PerformanceResponse | null = null;
  loading = true;
  errorMessage = '';
  periode: 'jour' | 'semaine' | 'mois' | 'tout' = 'mois';
  periodes = [
    { value: 'jour', label: "Aujourd'hui" },
    { value: 'semaine', label: 'Cette semaine' },
    { value: 'mois', label: 'Ce mois' },
    { value: 'tout', label: 'Tout' }
  ];

  // Plage de dates personnalisée (comme le bilan)
  debut = '';
  fin = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.charger(); }

  /** Sélection d'une période prédéfinie : réinitialise la plage personnalisée. */
  choisirPeriode(value: 'jour' | 'semaine' | 'mois' | 'tout'): void {
    this.periode = value;
    this.debut = '';
    this.fin = '';
    this.charger();
  }

  /** Applique la plage de dates saisie (nécessite début ET fin). */
  appliquerPlage(): void {
    if (this.debut && this.fin) {
      this.charger();
    }
  }

  get plageActive(): boolean {
    return !!(this.debut && this.fin);
  }

  charger(): void {
    this.loading = true;
    this.errorMessage = '';
    const debut = this.plageActive ? this.debut : undefined;
    const fin = this.plageActive ? this.fin : undefined;
    this.api.getPerformance(this.periode, debut, fin).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (err) => { this.errorMessage = err?.error?.message || 'Impossible de charger les performances'; this.loading = false; }
    });
  }

  formatDuree(min?: number | null): string {
    if (min == null) return '—';
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}h ${m}min` : `${h}h`;
  }
}
