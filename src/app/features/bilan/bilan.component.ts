import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../shared/pipes/fcfa.pipe';
import { BilanVendeur } from '../../core/models/bilan-vendeur.model';

/**
 * Page Bilan : stock actuel + ventes sur la période (défaut = aujourd'hui).
 * - Vendeur : son propre bilan.
 * - Admin : sélectionne un partenaire (ou arrive via /admin/vendeurs/:id/bilan).
 */
@Component({
  selector: 'app-bilan',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './bilan.component.html',
  styleUrls: ['./bilan.component.css']
})
export class BilanComponent implements OnInit {
  adminMode = false;
  vendeurId: number | null = null;   // partenaire ciblé (admin) ou null
  bilan: BilanVendeur | null = null;
  loading = true;
  errorMessage = '';
  downloading = false;

  // Sélecteur de partenaire (admin uniquement)
  vendeurs: { id: number; label: string }[] = [];
  selectedVendeurId: number | null = null;

  debut = this.today();
  fin = this.today();

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.adminMode = this.auth.isAdmin();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.vendeurId = Number(idParam);
      this.selectedVendeurId = this.vendeurId;
    }

    if (this.adminMode && this.vendeurId === null) {
      // Mode sélection : charger la liste des partenaires, pas encore de bilan
      this.chargerVendeurs();
      this.loading = false;
    } else {
      this.charger();
    }
  }

  today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  chargerVendeurs(): void {
    this.api.getVendeurs(undefined, 0, 200).subscribe({
      next: (page) => {
        this.vendeurs = (page.content || []).map((v: any) => ({
          id: v.id,
          label: (v.nomBoutique ? v.nomBoutique + ' — ' : '') + v.prenom + ' ' + v.nom
        }));
      },
      error: () => { this.toast.error('Impossible de charger la liste des partenaires'); }
    });
  }

  onSelectVendeur(): void {
    this.vendeurId = this.selectedVendeurId;
    this.bilan = null;
    if (this.vendeurId !== null) {
      this.charger();
    }
  }

  raccourci(jours: number): void {
    const d = new Date();
    d.setDate(d.getDate() - jours);
    this.debut = d.toISOString().slice(0, 10);
    this.fin = this.today();
    this.charger();
  }

  charger(): void {
    if (this.adminMode && this.vendeurId === null) { return; }
    this.loading = true;
    this.errorMessage = '';
    const obs = this.adminMode
      ? this.api.getAdminVendeurBilan(this.vendeurId!, this.debut, this.fin)
      : this.api.getVendeurBilan(this.debut, this.fin);

    obs.subscribe({
      next: (b) => { this.bilan = b; this.loading = false; },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Impossible de charger le bilan';
        this.loading = false;
      }
    });
  }

  telechargerPdf(): void {
    this.downloading = true;
    const obs = this.adminMode
      ? this.api.downloadAdminVendeurBilanPdf(this.vendeurId!, this.debut, this.fin)
      : this.api.downloadVendeurBilanPdf(this.debut, this.fin);

    obs.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const boutique = this.bilan?.vendeur?.nomBoutique?.replace(/[^a-zA-Z0-9-_]/g, '_') || 'vendeur';
        a.download = `bilan-${boutique}-${this.debut}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloading = false;
      },
      error: () => {
        this.toast.error('Impossible de télécharger le PDF');
        this.downloading = false;
      }
    });
  }

  get periodeLabel(): string {
    if (!this.bilan) { return ''; }
    if (this.bilan.periodeDebut === this.bilan.periodeFin) {
      return `Journée du ${this.fmt(this.bilan.periodeDebut)}`;
    }
    return `Du ${this.fmt(this.bilan.periodeDebut)} au ${this.fmt(this.bilan.periodeFin)}`;
  }

  private fmt(d: string): string {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
