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
import { StatutVendeur, VendeurDTO } from '../../../core/models/vendeur.model';

type Onglet = 'closeurs' | 'livreurs' | 'dispatcheurs';

interface MembreForm {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  password: string;
  zonePreferee: string;
  /** true = pas de restriction (tous les vendeurs), false = restreint à vendeurIds */
  tousLesVendeurs: boolean;
  vendeurIds: number[];
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
  dispatcheurs: MembreResponse[] = [];
  vendeurs: VendeurDTO[] = [];
  loading = true;
  loadError = false;

  showModal = false;
  saving = false;
  editId: number | null = null;   // null = création, sinon édition
  form: MembreForm = this.formVide();
  filtreVendeur = '';

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
    this.api.getDispatcheurs().subscribe({
      next: (d) => { this.dispatcheurs = d; },
      error: () => { this.loadError = true; }
    });
    this.api.getVendeurs({ statut: StatutVendeur.ACTIF }, 0, 500).subscribe({
      next: (p) => { this.vendeurs = p.content; },
      error: () => { /* la liste des vendeurs n'est pas critique pour le reste de l'écran */ }
    });
  }

  /** Libellé du vendeur pour l'affichage (boutique si connue, sinon nom du vendeur). */
  libelleVendeur(id: number): string {
    const v = this.vendeurs.find(x => x.id === id);
    if (!v) return `Vendeur #${id}`;
    return v.nomBoutique || `${v.prenom} ${v.nom}`;
  }

  /** Résumé affiché dans la liste des closeurs. */
  resumeVendeurs(membre: MembreResponse): string {
    if (!membre.vendeurIds || membre.vendeurIds.length === 0) return 'Tous les vendeurs';
    return membre.vendeurIds.map(id => this.libelleVendeur(id)).join(', ');
  }

  get vendeursFiltres(): VendeurDTO[] {
    const q = this.filtreVendeur.trim().toLowerCase();
    if (!q) return this.vendeurs;
    return this.vendeurs.filter(v =>
      (v.nomBoutique || '').toLowerCase().includes(q) ||
      `${v.prenom} ${v.nom}`.toLowerCase().includes(q)
    );
  }

  estVendeurSelectionne(id: number): boolean {
    return this.form.vendeurIds.includes(id);
  }

  toggleVendeur(id: number): void {
    this.form.vendeurIds = this.estVendeurSelectionne(id)
      ? this.form.vendeurIds.filter(v => v !== id)
      : [...this.form.vendeurIds, id];
  }

  changerOnglet(o: Onglet): void {
    this.onglet = o;
  }

  get isEdition(): boolean {
    return this.editId !== null;
  }

  get singulier(): string {
    return this.onglet === 'closeurs' ? 'closeur'
      : this.onglet === 'dispatcheurs' ? 'dispatcheur'
      : 'livreur';
  }

  ouvrirCreate(): void {
    this.editId = null;
    this.form = this.formVide();
    this.filtreVendeur = '';
    this.showModal = true;
  }

  ouvrirEdit(membre: MembreResponse | LivreurResponse): void {
    this.editId = membre.id;
    const vendeurIds = (membre as MembreResponse).vendeurIds || [];
    this.form = {
      nom: membre.nom,
      prenom: membre.prenom,
      telephone: membre.telephone,
      email: membre.email || '',
      password: '',
      zonePreferee: (membre as LivreurResponse).zonePreferee || '',
      tousLesVendeurs: vendeurIds.length === 0,
      vendeurIds
    };
    this.filtreVendeur = '';
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
    if (this.onglet === 'closeurs' && !this.form.tousLesVendeurs && this.form.vendeurIds.length === 0) {
      this.toast.warning('Sélectionnez au moins un vendeur, ou cochez "Tous les vendeurs"');
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
    const obs: Observable<MembreResponse | LivreurResponse> =
      this.onglet === 'closeurs' ? this.api.updateCloseur(membre.id, data)
      : this.onglet === 'dispatcheurs' ? this.api.updateDispatcheur(membre.id, data)
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
      zonePreferee: this.form.zonePreferee || undefined,
      vendeurIds: this.onglet === 'closeurs' ? (this.form.tousLesVendeurs ? [] : this.form.vendeurIds) : undefined
    };
    return this.onglet === 'closeurs' ? this.api.createCloseur(data)
      : this.onglet === 'dispatcheurs' ? this.api.createDispatcheur(data)
      : this.api.createLivreur(data);
  }

  private appelUpdate(): Observable<MembreResponse | LivreurResponse> {
    const data: UpdateMembreRequest = {
      nom: this.form.nom,
      prenom: this.form.prenom,
      telephone: this.form.telephone,
      email: this.form.email || undefined,
      zonePreferee: this.form.zonePreferee || undefined,
      password: this.form.password || undefined,
      vendeurIds: this.onglet === 'closeurs' ? (this.form.tousLesVendeurs ? [] : this.form.vendeurIds) : undefined
    };
    return this.onglet === 'closeurs' ? this.api.updateCloseur(this.editId!, data)
      : this.onglet === 'dispatcheurs' ? this.api.updateDispatcheur(this.editId!, data)
      : this.api.updateLivreur(this.editId!, data);
  }

  private formVide(): MembreForm {
    return {
      nom: '', prenom: '', telephone: '', email: '', password: '', zonePreferee: '',
      tousLesVendeurs: true, vendeurIds: []
    };
  }
}
