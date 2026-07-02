import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../shared/pipes/fcfa.pipe';
import { ClassementEntry, ClassementResponse, TIERS, TierMeta, tierMeta } from '../../core/models/classement.model';

/**
 * Dioks League — classement gamifié animé.
 * Vendeur : adhésion (avec politique de partage), classement, tiers, progression.
 * Admin : vue complète en lecture seule.
 */
@Component({
  selector: 'app-classement',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './classement.component.html',
  styleUrls: ['./classement.component.css']
})
export class ClassementComponent implements OnInit {
  @ViewChild('confettiLayer') confettiLayer?: ElementRef<HTMLDivElement>;

  adminMode = false;
  loading = true;
  errorMessage = '';
  data: ClassementResponse | null = null;

  showPolicy = false;
  joining = false;
  leaving = false;

  tiers = TIERS;
  displayLivraisons = 0;   // valeur animée (count-up)

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.adminMode = this.auth.isAdmin();
    this.charger(false);
  }

  charger(animer: boolean): void {
    this.loading = true;
    const obs = this.adminMode ? this.api.getAdminClassement() : this.api.getClassement();
    obs.subscribe({
      next: (d) => {
        this.data = d;
        this.loading = false;
        if (d.participe || this.adminMode) {
          this.countUp(d.mesLivraisons);
          if (animer) { setTimeout(() => this.confetti(), 250); }
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Impossible de charger le classement';
        this.loading = false;
      }
    });
  }

  // ==================== ADHÉSION ====================

  ouvrirPolitique(): void { this.showPolicy = true; }
  fermerPolitique(): void { this.showPolicy = false; }

  rejoindre(): void {
    this.joining = true;
    this.api.rejoindreClassement().subscribe({
      next: (d) => {
        this.data = d;
        this.joining = false;
        this.showPolicy = false;
        this.toast.success('Bienvenue dans la Dioks League ! 🏆');
        this.countUp(d.mesLivraisons);
        setTimeout(() => this.confetti(), 200);
      },
      error: (err) => {
        this.joining = false;
        this.toast.error(err?.error?.message || 'Impossible de rejoindre');
      }
    });
  }

  quitter(): void {
    if (!confirm('Quitter la Dioks League ? Tu peux revenir à tout moment, tes stats sont conservées.')) { return; }
    this.leaving = true;
    this.api.quitterClassement().subscribe({
      next: (d) => { this.data = d; this.leaving = false; this.toast.success('Tu as quitté la ligue. Reviens quand tu veux !'); },
      error: (err) => { this.leaving = false; this.toast.error(err?.error?.message || 'Action impossible'); }
    });
  }

  // ==================== DÉRIVÉS ====================

  get podium(): ClassementEntry[] {
    const e = this.data?.entries || [];
    // Ordre visuel : 2e, 1er, 3e
    const p: ClassementEntry[] = [];
    if (e[1]) p.push(e[1]);
    if (e[0]) p.push(e[0]);
    if (e[2]) p.push(e[2]);
    return p;
  }

  get reste(): ClassementEntry[] {
    return this.data?.entries || [];
  }

  meta(t?: string | null): TierMeta { return tierMeta(t as any); }

  gradient(t?: string | null): string {
    const m = this.meta(t);
    return `linear-gradient(135deg, ${m.from}, ${m.to})`;
  }

  glow(t?: string | null): string { return this.meta(t).glow; }

  podiumClass(rang: number): string {
    return rang === 1 ? 'h-32 sm:h-40' : rang === 2 ? 'h-24 sm:h-32' : 'h-20 sm:h-28';
  }

  // ==================== ANIMATIONS ====================

  private countUp(cible: number): void {
    const duree = 900;
    const debut = performance.now();
    const from = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - debut) / duree);
      const eased = 1 - Math.pow(1 - t, 3);
      this.displayLivraisons = Math.round(from + (cible - from) * eased);
      if (t < 1) { requestAnimationFrame(step); }
    };
    requestAnimationFrame(step);
  }

  confetti(): void {
    const layer = this.confettiLayer?.nativeElement;
    if (!layer) { return; }
    const colors = ['#0066cc', '#22d3ee', '#f5c83c', '#a855f7', '#34d399', '#f472b6'];
    for (let i = 0; i < 90; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 0.3 + 's';
      piece.style.animationDuration = 1.8 + Math.random() * 1.4 + 's';
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      layer.appendChild(piece);
      setTimeout(() => piece.remove(), 3400);
    }
  }
}
