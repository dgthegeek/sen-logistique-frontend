import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-[#0a1024]/85 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <a routerLink="/" class="flex items-center gap-3">
              <img src="assets/icons/icon-512.png" alt="Dioks" class="w-10 h-10 rounded-lg">
              <span class="text-2xl font-bold text-primary">Dioks</span>
            </a>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-8">
            <a (click)="navigateToSection('services')" class="nav-link">Services</a>
            <a (click)="navigateToSection('zones')" class="nav-link">Zones</a>
            <a (click)="navigateToSection('tarifs')" class="nav-link">Tarifs</a>
            <a (click)="navigateToSection('why-dioks')" class="nav-link">Pourquoi Dioks ?</a>
            <a routerLink="/a-propos" class="nav-link" routerLinkActive="text-primary">À propos</a>
            <a (click)="navigateToSection('contact')" class="nav-link">Contact</a>
          </div>

          <!-- Actions -->
          <div class="hidden md:flex items-center gap-4">
            <a routerLink="/tracking" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary rounded-lg hover:bg-primary hover:text-white transition-all">
              <i class="fa-solid fa-location-dot"></i>
              <span>Suivre un colis</span>
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
          <a (click)="navigateToSection('services')" class="block px-4 py-2 hover:bg-muted rounded cursor-pointer">Services</a>
          <a (click)="navigateToSection('zones')" class="block px-4 py-2 hover:bg-muted rounded cursor-pointer">Zones</a>
          <a (click)="navigateToSection('tarifs')" class="block px-4 py-2 hover:bg-muted rounded cursor-pointer">Tarifs</a>
          <a (click)="navigateToSection('why-dioks')" class="block px-4 py-2 hover:bg-muted rounded cursor-pointer">Pourquoi Dioks ?</a>
          <a routerLink="/a-propos" (click)="mobileMenuOpen = false" class="block px-4 py-2 hover:bg-muted rounded">À propos</a>
          <a (click)="navigateToSection('contact')" class="block px-4 py-2 hover:bg-muted rounded cursor-pointer">Contact</a>
          <div class="border-t pt-3 space-y-2">
            <a routerLink="/tracking" (click)="mobileMenuOpen = false" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary rounded-lg hover:bg-primary hover:text-white transition-all"> 
              <i class="fa-solid fa-location-dot"></i>
              <span>Suivre un colis</span>
            </a>
            <a *ngIf="!isAuthenticated" routerLink="/login" (click)="mobileMenuOpen = false" class="block px-4 py-2 btn-outline text-center">Se connecter</a>
            <a *ngIf="!isAuthenticated" routerLink="/register" (click)="mobileMenuOpen = false" class="block px-4 py-2 btn-primary text-center">Rejoindre</a>
            <a *ngIf="isAuthenticated" [routerLink]="dashboardLink" (click)="mobileMenuOpen = false" class="block px-4 py-2 btn-primary text-center">Dashboard</a>
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
    private router: Router,
    public theme: ThemeService
  ) { }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get dashboardLink(): string {
    return this.authService.getHomeRoute();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  /**
   * Navigation intelligente vers sections
   * - Si sur home: scroll direct
   * - Si ailleurs: navigate vers home puis scroll
   */
  navigateToSection(sectionId: string) {
    this.mobileMenuOpen = false;

    // Vérifier si on est sur la home
    const isOnHome = this.router.url === '/' || this.router.url === '/home';

    if (isOnHome) {
      // Déjà sur home → scroll direct
      this.scrollToElement(sectionId);
    } else {
      // Sur autre page → navigate puis scroll
      this.router.navigate(['/']).then(() => {
        // Attendre que la page soit chargée
        setTimeout(() => {
          this.scrollToElement(sectionId);
        }, 100);
      });
    }
  }

  /**
   * Scroll vers élément avec smooth behavior
   */
  private scrollToElement(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}