import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white border-b sticky top-0 z-50 shadow-sm">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <a routerLink="/" class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-xl">D</span>
              </div>
              <span class="text-2xl font-bold text-primary">Dioks</span>
            </a>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-8">
            <a (click)="scrollTo('services')" class="nav-link">Services</a>
            <a (click)="scrollTo('why-dioks')" class="nav-link">Pourquoi Dioks ?</a>
            <a (click)="scrollTo('how-it-works')" class="nav-link">Comment ça marche</a>
            <a (click)="scrollTo('testimonials')" class="nav-link">Témoignages</a>
            <a (click)="scrollTo('contact')" class="nav-link">Contact</a>
          </div>

          <!-- Actions -->
          <div class="hidden md:flex items-center gap-4">
            <a routerLink="/tracking" class="text-sm text-primary hover:underline">
              📦 Suivre un colis
            </a>
            <a *ngIf="!isAuthenticated" routerLink="/login" class="btn-outline text-sm">
              Se connecter
            </a>
            <a *ngIf="!isAuthenticated" routerLink="/register" class="btn-primary text-sm">
              Rejoindre
            </a>
            <a *ngIf="isAuthenticated" [routerLink]="dashboardLink" class="btn-primary text-sm">
              Dashboard
            </a>
          </div>

          <!-- Mobile menu button -->
          <button (click)="toggleMobileMenu()" class="md:hidden p-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path *ngIf="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              <path *ngIf="mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Mobile Navigation -->
        <div *ngIf="mobileMenuOpen" class="md:hidden py-4 space-y-3">
          <a (click)="scrollTo('services')" class="block px-4 py-2 hover:bg-muted rounded">Services</a>
          <a (click)="scrollTo('why-dioks')" class="block px-4 py-2 hover:bg-muted rounded">Pourquoi Dioks ?</a>
          <a (click)="scrollTo('how-it-works')" class="block px-4 py-2 hover:bg-muted rounded">Comment ça marche</a>
          <a (click)="scrollTo('testimonials')" class="block px-4 py-2 hover:bg-muted rounded">Témoignages</a>
          <a (click)="scrollTo('contact')" class="block px-4 py-2 hover:bg-muted rounded">Contact</a>
          <div class="border-t pt-3 space-y-2">
            <a routerLink="/tracking" class="block px-4 py-2 text-primary">📦 Suivre un colis</a>
            <a *ngIf="!isAuthenticated" routerLink="/login" class="block px-4 py-2 btn-outline text-center">Se connecter</a>
            <a *ngIf="!isAuthenticated" routerLink="/register" class="block px-4 py-2 btn-primary text-center">Rejoindre</a>
            <a *ngIf="isAuthenticated" [routerLink]="dashboardLink" class="block px-4 py-2 btn-primary text-center">Dashboard</a>
          </div>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .nav-link {
      @apply text-sm font-medium text-muted-foreground hover:text-primary cursor-pointer transition-colors;
    }
  `]
})
export class PublicHeaderComponent {
  mobileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get dashboardLink(): string {
    const user = this.authService.getCurrentUser();
    return user?.role === 'ADMIN' ? '/admin/dashboard' : '/vendeur/dashboard';
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  scrollTo(sectionId: string) {
    this.mobileMenuOpen = false;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}