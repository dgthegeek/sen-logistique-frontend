import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { CommandeDispatch, LivreurResponse } from '../../../core/models/closing-dispatch.model';

@Component({
  selector: 'app-admin-dispatch',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './dispatch.component.html',
  styleUrls: ['./dispatch.component.css']
})
export class AdminDispatchComponent implements OnInit {
  commandes: CommandeDispatch[] = [];
  livreurs: LivreurResponse[] = [];
  selection = new Set<number>();
  livreurId: number | null = null;
  loading = true;
  loadError = false;
  assigning = false;

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.charger();
    this.chargerLivreurs();
  }

  charger(): void {
    this.loading = true;
    this.loadError = false;
    this.api.getDispatchPretes().subscribe({
      next: (data) => {
        this.commandes = data;
        this.selection.clear();
        this.loading = false;
      },
      error: () => {
        this.loadError = true;
        this.loading = false;
      }
    });
  }

  chargerLivreurs(): void {
    this.api.getLivreurs().subscribe({
      next: (data) => this.livreurs = data.filter(l => l.actif),
      error: () => {}
    });
  }

  toggle(id: number): void {
    if (this.selection.has(id)) { this.selection.delete(id); }
    else { this.selection.add(id); }
  }

  toutSelectionner(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) { this.commandes.forEach(c => this.selection.add(c.id)); }
    else { this.selection.clear(); }
  }

  estSelectionnee(id: number): boolean {
    return this.selection.has(id);
  }

  assigner(): void {
    if (this.selection.size === 0) {
      this.toast.warning('Sélectionnez au moins une commande');
      return;
    }
    if (!this.livreurId) {
      this.toast.warning('Choisissez un livreur');
      return;
    }
    this.assigning = true;
    this.api.assignerLivreur({
      livraisonIds: Array.from(this.selection),
      livreurId: this.livreurId
    }).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.assigning = false;
        this.livreurId = null;
        this.charger();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Assignation impossible');
        this.assigning = false;
      }
    });
  }
}
