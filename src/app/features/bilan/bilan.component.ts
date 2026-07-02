import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../shared/pipes/fcfa.pipe';
import { BilanVendeur } from '../../core/models/bilan-vendeur.model';

/**
 * Page Bilan : stock actuel + ventes sur la période (défaut = aujourd'hui).
 * Utilisée par le vendeur (son propre bilan) et par l'admin (bilan d'un vendeur donné via :id).
 */
@Component({
  selector: 'app-bilan',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './bilan.component.html',
  styleUrls: ['./bilan.component.css']
})
export class BilanComponent implements OnInit {
  vendeurId: number | null = null;   // présent => mode admin
  bilan: BilanVendeur | null = null;
  loading = true;
  errorMessage = '';
  downloading = false;

  debut = this.today();
  fin = this.today();

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.vendeurId = idParam ? Number(idParam) : null;
    this.charger();
  }

  get isAdmin(): boolean {
    return this.vendeurId !== null;
  }

  today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  raccourci(jours: number): void {
    const d = new Date();
    d.setDate(d.getDate() - jours);
    this.debut = d.toISOString().slice(0, 10);
    this.fin = this.today();
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.errorMessage = '';
    const obs = this.isAdmin
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
    const obs = this.isAdmin
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
