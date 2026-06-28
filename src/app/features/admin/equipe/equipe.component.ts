import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { Observable } from 'rxjs';
import { CreateMembreRequest, LivreurResponse, MembreResponse } from '../../../core/models/closing-dispatch.model';

type Onglet = 'closeurs' | 'livreurs';

@Component({
  selector: 'app-admin-equipe',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent],
  templateUrl: './equipe.component.html',
  styleUrls: ['./equipe.component.css']
})
export class AdminEquipeComponent implements OnInit {
  onglet: Onglet = 'closeurs';
  closeurs: MembreResponse[] = [];
  livreurs: LivreurResponse[] = [];
  loading = true;

  showModal = false;
  saving = false;
  form: CreateMembreRequest = this.formVide();

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.api.getCloseurs().subscribe({
      next: (d) => { this.closeurs = d; },
      error: () => this.toast.error('Erreur chargement closeurs')
    });
    this.api.getLivreurs().subscribe({
      next: (d) => { this.livreurs = d; this.loading = false; },
      error: () => { this.toast.error('Erreur chargement livreurs'); this.loading = false; }
    });
  }

  changerOnglet(o: Onglet): void {
    this.onglet = o;
  }

  ouvrirModal(): void {
    this.form = this.formVide();
    this.showModal = true;
  }

  fermerModal(): void {
    this.showModal = false;
  }

  enregistrer(): void {
    if (!this.form.nom || !this.form.prenom || !this.form.telephone || !this.form.password) {
      this.toast.warning('Nom, prénom, téléphone et mot de passe sont obligatoires');
      return;
    }
    this.saving = true;
    const obs: Observable<MembreResponse | LivreurResponse> = this.onglet === 'closeurs'
      ? this.api.createCloseur(this.form)
      : this.api.createLivreur(this.form);

    obs.subscribe({
      next: () => {
        this.toast.success(this.onglet === 'closeurs' ? 'Closeur créé' : 'Livreur créé');
        this.saving = false;
        this.fermerModal();
        this.charger();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Création impossible');
        this.saving = false;
      }
    });
  }

  private formVide(): CreateMembreRequest {
    return { nom: '', prenom: '', telephone: '', email: '', password: '', zonePreferee: '' };
  }
}
