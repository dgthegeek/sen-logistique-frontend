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
            class="fixed bottom-5 right-5 z-[60] w-12 h-12 rounded-full flex items-center justify-center
                   shadow-lg border border-border bg-card/90 backdrop-blur
                   hover:scale-105 active:scale-95 transition-transform"
            [attr.aria-label]="theme.isDark ? 'Passer en mode clair' : 'Passer en mode futuriste'"
            [title]="theme.isDark ? 'Passer en mode clair' : 'Passer en mode futuriste'">
      <i class="fa-solid text-lg" [ngClass]="theme.isDark ? 'fa-sun text-accent' : 'fa-moon text-primary'"></i>
    </button>
  `
})
export class ThemeToggleComponent {
  constructor(public theme: ThemeService) {}
}
