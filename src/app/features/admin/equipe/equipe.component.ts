import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { Observable } from 'rxjs';
import {
  CreateMembreRequest, UpdateMembreRequest, LivreurResponse, MembreResponse
} from '../../../core/models/closing-dispatch.model';

type Onglet = 'closeurs' | 'livreurs';

interface MembreForm {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  password: string;
  zonePreferee: string;
}

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
  loadError = false;

  showModal = false;
  saving = false;
  editId: number | null = null;   // null = création, sinon édition
  form: MembreForm = this.formVide();

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.loadError = false;
    this.api.getCloseurs().subscribe({
      next: (d) => { this.closeurs = d; },
      error: () => { this.loadError = true; }
    });
    this.api.getLivreurs().subscribe({
      next: (d) => { this.livreurs = d; this.loading = false; },
      error: () => { this.loadError = true; this.loading = false; }
    });
  }

  changerOnglet(o: Onglet): void {
    this.onglet = o;
  }

  get isEdition(): boolean {
    return this.editId !== null;
  }

  ouvrirCreate(): void {
    this.editId = null;
    this.form = this.formVide();
    this.showModal = true;
  }

  ouvrirEdit(membre: MembreResponse | LivreurResponse): void {
    this.editId = membre.id;
    this.form = {
      nom: membre.nom,
      prenom: membre.prenom,
      telephone: membre.telephone,
      email: membre.email || '',
      password: '',
      zonePreferee: (membre as LivreurResponse).zonePreferee || ''
    };
    this.showModal = true;
  }

  fermerModal(): void {
    this.showModal = false;
    this.editId = null;
  }

  enregistrer(): void {
    if (!this.form.nom || !this.form.prenom || !this.form.telephone) {
      this.toast.warning('Nom, prénom et téléphone sont obligatoires');
      return;
    }
    if (!this.isEdition && !this.form.password) {
      this.toast.warning('Le mot de passe est obligatoire à la création');
      return;
    }
    this.saving = true;
    const obs: Observable<MembreResponse | LivreurResponse> = this.isEdition
      ? this.appelUpdate()
      : this.appelCreate();

    obs.subscribe({
      next: () => {
        this.toast.success(this.isEdition ? 'Membre mis à jour' : 'Membre créé');
        this.saving = false;
        this.fermerModal();
        this.charger();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Opération impossible');
        this.saving = false;
      }
    });
  }

  /** Activer/désactiver rapidement un membre. */
  toggleActif(membre: MembreResponse | LivreurResponse): void {
    const data: UpdateMembreRequest = { actif: !membre.actif };
    const obs: Observable<MembreResponse | LivreurResponse> = this.onglet === 'closeurs'
      ? this.api.updateCloseur(membre.id, data)
      : this.api.updateLivreur(membre.id, data);
    obs.subscribe({
      next: () => { this.toast.success(membre.actif ? 'Compte désactivé' : 'Compte activé'); this.charger(); },
      error: (err) => this.toast.error(err?.error?.message || 'Action impossible')
    });
  }

  private appelCreate(): Observable<MembreResponse | LivreurResponse> {
    const data: CreateMembreRequest = {
      nom: this.form.nom,
      prenom: this.form.prenom,
      telephone: this.form.telephone,
      email: this.form.email || undefined,
      password: this.form.password,
      zonePreferee: this.form.zonePreferee || undefined
    };
    return this.onglet === 'closeurs' ? this.api.createCloseur(data) : this.api.createLivreur(data);
  }

  private appelUpdate(): Observable<MembreResponse | LivreurResponse> {
    const data: UpdateMembreRequest = {
      nom: this.form.nom,
      prenom: this.form.prenom,
      telephone: this.form.telephone,
      email: this.form.email || undefined,
      zonePreferee: this.form.zonePreferee || undefined,
      password: this.form.password || undefined
    };
    return this.onglet === 'closeurs'
      ? this.api.updateCloseur(this.editId!, data)
      : this.api.updateLivreur(this.editId!, data);
  }

  private formVide(): MembreForm {
    return { nom: '', prenom: '', telephone: '', email: '', password: '', zonePreferee: '' };
  }
}
