import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { LivraisonAdmin, TransactionAdmin } from '../../../core/models/admin.model';
import { MembreResponse, LivreurResponse } from '../../../core/models/closing-dispatch.model';
import { VendeurDTO } from '../../../core/models/vendeur.model';
import { STATUT_LABELS } from '../../../core/models/statut-labels';
import { StatutLivraison } from '../../../core/models/closing-dispatch.model';

type Tab = 'livraisons' | 'transactions' | 'equipe' | 'vendeurs';
interface Membre { id: number; nom: string; prenom: string; telephone: string; role: string; }

/**
 * Écran d'administration pour supprimer des données (nettoyage de tests).
 * Réservé à l'admin. Chaque suppression demande une double confirmation.
 */
@Component({
  selector: 'app-admin-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})
export class AdminMaintenanceComponent implements OnInit {
  tab: Tab = 'livraisons';
  loading = false;
  deletingId: number | null = null;

  // Livraisons
  livraisons: LivraisonAdmin[] = [];
  livPage = 0; livTotalPages = 0; livTotalElements = 0;

  // Transactions
  transactions: TransactionAdmin[] = [];

  // Équipe (closeurs + livreurs + coordinateurs)
  membres: Membre[] = [];

  // Vendeurs
  vendeurs: VendeurDTO[] = [];

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private confirm: ConfirmationService
  ) {}

  ngOnInit(): void { this.chargerLivraisons(); }

  label(statut: string): string { return STATUT_LABELS[statut as StatutLivraison] || statut; }

  switchTab(t: Tab): void {
    this.tab = t;
    if (t === 'livraisons' && this.livraisons.length === 0) { this.chargerLivraisons(); }
    if (t === 'transactions' && this.transactions.length === 0) { this.chargerTransactions(); }
    if (t === 'equipe' && this.membres.length === 0) { this.chargerEquipe(); }
    if (t === 'vendeurs' && this.vendeurs.length === 0) { this.chargerVendeurs(); }
  }

  // ---------- Chargements ----------
  chargerLivraisons(): void {
    this.loading = true;
    this.api.getLivraisonsAdmin(this.livPage, 30).subscribe({
      next: (res) => {
        this.livraisons = res.content;
        this.livTotalPages = res.totalPages;
        this.livTotalElements = res.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; this.toast.error('Chargement des livraisons impossible'); }
    });
  }

  chargerTransactions(): void {
    this.loading = true;
    this.api.getTransactionsAdmin(undefined, undefined, undefined, 0, 50).subscribe({
      next: (res) => { this.transactions = res.content; this.loading = false; },
      error: () => { this.loading = false; this.toast.error('Chargement des transactions impossible'); }
    });
  }

  chargerEquipe(): void {
    this.loading = true;
    this.membres = [];
    let pending = 3;
    const done = () => { if (--pending === 0) { this.loading = false; } };
    this.api.getCloseurs().subscribe({
      next: (l) => { this.membres.push(...l.map(m => this.toMembre(m, 'CLOSEUR'))); done(); }, error: done
    });
    this.api.getLivreurs().subscribe({
      next: (l) => { this.membres.push(...l.map(m => this.toMembre(m, 'LIVREUR'))); done(); }, error: done
    });
    this.api.getDispatcheurs().subscribe({
      next: (l) => { this.membres.push(...l.map(m => this.toMembre(m, 'DISPATCHEUR'))); done(); }, error: done
    });
  }

  private toMembre(m: MembreResponse | LivreurResponse, role: string): Membre {
    return { id: m.id, nom: m.nom, prenom: m.prenom, telephone: m.telephone, role };
  }

  roleLabel(role: string): string {
    return role === 'DISPATCHEUR' ? 'Coordinateur' : role.charAt(0) + role.slice(1).toLowerCase();
  }

  chargerVendeurs(): void {
    this.loading = true;
    this.api.getVendeurs(undefined, 0, 100).subscribe({
      next: (res) => { this.vendeurs = res.content; this.loading = false; },
      error: () => { this.loading = false; this.toast.error('Chargement des vendeurs impossible'); }
    });
  }

  // ---------- Suppressions ----------
  supprimerLivraison(l: LivraisonAdmin): void {
    this.confirm.confirm({
      title: 'Supprimer la livraison',
      message: `Supprimer définitivement la livraison ${l.numeroTracking} ? Ses lignes de commande seront supprimées. Cette action est irréversible.`,
      confirmText: 'Supprimer', type: 'danger',
      onConfirm: () => {
        this.deletingId = l.id;
        this.api.maintenanceSupprimerLivraison(l.id).subscribe({
          next: (r) => { this.toast.success(r.message); this.deletingId = null; this.livraisons = this.livraisons.filter(x => x.id !== l.id); },
          error: (e) => { this.deletingId = null; this.toast.error(e?.error?.message || 'Suppression impossible'); }
        });
      }
    });
  }

  supprimerTransaction(t: TransactionAdmin): void {
    this.confirm.confirm({
      title: 'Supprimer la transaction',
      message: `Supprimer définitivement la transaction ${t.reference} (${t.montant} FCFA) ?`,
      confirmText: 'Supprimer', type: 'danger',
      onConfirm: () => {
        this.deletingId = t.id;
        this.api.maintenanceSupprimerTransaction(t.id).subscribe({
          next: (r) => { this.toast.success(r.message); this.deletingId = null; this.transactions = this.transactions.filter(x => x.id !== t.id); },
          error: (e) => { this.deletingId = null; this.toast.error(e?.error?.message || 'Suppression impossible'); }
        });
      }
    });
  }

  supprimerMembre(m: Membre): void {
    this.confirm.confirm({
      title: `Supprimer ${this.roleLabel(m.role)}`,
      message: `Supprimer le compte de ${m.prenom} ${m.nom} (${m.telephone}) ? Les livraisons rattachées seront conservées mais dissociées de ce membre.`,
      confirmText: 'Supprimer', type: 'danger',
      onConfirm: () => {
        this.deletingId = m.id;
        this.api.maintenanceSupprimerMembre(m.id).subscribe({
          next: (r) => { this.toast.success(r.message); this.deletingId = null; this.membres = this.membres.filter(x => !(x.id === m.id && x.role === m.role)); },
          error: (e) => { this.deletingId = null; this.toast.error(e?.error?.message || 'Suppression impossible'); }
        });
      }
    });
  }

  supprimerVendeur(v: VendeurDTO): void {
    // 1) Récupérer l'impact, 2) confirmer avec les comptes, 3) supprimer.
    this.deletingId = v.id;
    this.api.maintenanceImpactVendeur(v.id).subscribe({
      next: (impact) => {
        this.deletingId = null;
        this.confirm.confirm({
          title: '⚠️ Supprimer le vendeur et TOUTES ses données',
          message: `Cette action supprimera définitivement ${v.prenom} ${v.nom} ainsi que :\n`
            + `• ${impact.livraisons} livraison(s)\n`
            + `• ${impact.transactions} transaction(s)\n`
            + `• ${impact.produits} produit(s)\n\n`
            + `Cette opération est IRRÉVERSIBLE.`,
          confirmText: 'Tout supprimer', type: 'danger',
          onConfirm: () => {
            this.deletingId = v.id;
            this.api.maintenanceSupprimerVendeur(v.id).subscribe({
              next: (r) => { this.toast.success(r.message); this.deletingId = null; this.vendeurs = this.vendeurs.filter(x => x.id !== v.id); },
              error: (e) => { this.deletingId = null; this.toast.error(e?.error?.message || 'Suppression impossible'); }
            });
          }
        });
      },
      error: (e) => { this.deletingId = null; this.toast.error(e?.error?.message || 'Impossible de calculer l\'impact'); }
    });
  }

  pagePrecedente(): void { if (this.livPage > 0) { this.livPage--; this.chargerLivraisons(); } }
  pageSuivante(): void { if (this.livPage < this.livTotalPages - 1) { this.livPage++; this.chargerLivraisons(); } }
}
