import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white border-b sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo Dioks (cliquable vers home) -->
          <a routerLink="/" class="flex items-center gap-3">
            <img src="assets/icons/icon-512.png" alt="Dioks" class="w-10 h-10 rounded-lg">
            <span class="text-2xl font-bold text-primary">Dioks</span>
          </a>

          <!-- Action Button (dynamique) -->
          <a [routerLink]="linkUrl" class="btn-outline text-sm">
            {{ linkText }}
          </a>
        </div>
      </div>
    </header>
  `
})
export class AuthHeaderComponent {
  @Input() linkUrl: string = '/register';
  @Input() linkText: string = 'Créer un compte';
}