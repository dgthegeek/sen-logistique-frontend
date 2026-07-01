import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

/**
 * Bouton flottant global de bascule de thème (clair / futuriste).
 * Présent sur toutes les pages (placé au niveau racine de l'app).
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button (click)="theme.toggle()"
            class="theme-fab"
            [attr.aria-label]="theme.isDark ? 'Passer en mode clair' : 'Passer en mode futuriste'"
            [title]="theme.isDark ? 'Passer en mode clair' : 'Passer en mode futuriste'">
      <i class="fa-solid" [ngClass]="theme.isDark ? 'fa-sun' : 'fa-moon'"></i>
    </button>
  `,
  styles: [`
    .theme-fab {
      position: fixed;
      right: 1rem;
      bottom: 1rem;
      z-index: 1000;
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.15rem;
      background-image: linear-gradient(135deg, #2563eb, #06b6d4);
      box-shadow: 0 10px 30px -8px rgba(6, 182, 212, 0.6);
      border: 2px solid rgba(255, 255, 255, 0.85);
      transition: transform .15s ease, box-shadow .15s ease;
    }
    .theme-fab:hover { transform: scale(1.06); }
    .theme-fab:active { transform: scale(0.95); }
    @media (min-width: 768px) {
      .theme-fab { right: 1.25rem; bottom: 1.25rem; }
    }
  `]
})
export class ThemeToggleComponent {
  constructor(public theme: ThemeService) {}
}
