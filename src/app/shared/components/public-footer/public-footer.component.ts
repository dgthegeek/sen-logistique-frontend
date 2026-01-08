import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-gray-900 text-gray-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- À propos -->
          <div>
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i class="fa-solid fa-box text-white"></i>
              </div>
              <span class="text-xl font-bold text-white">Dioks</span>
            </div>
            <p class="text-sm text-gray-400 mb-4">
              La plateforme de livraison de confiance pour vos business.
            </p>
            <div class="flex gap-3">
              <a href="#" class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors" aria-label="Facebook">
                <i class="fa-brands fa-facebook text-white"></i>
              </a>
              <a href="#" class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors" aria-label="Instagram">
                <i class="fa-brands fa-instagram text-white"></i>
              </a>
              <a href="#" class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors" aria-label="Twitter">
                <i class="fa-brands fa-twitter text-white"></i>
              </a>
            </div>
          </div>

          <!-- Services -->
          <div>
            <h3 class="text-white font-semibold mb-4">Services</h3>
            <ul class="space-y-2 text-sm">
              <li>
                <a href="#services" class="hover:text-white transition-colors flex items-center gap-2">
                  <i class="fa-solid fa-truck-fast text-primary"></i>
                  <span>Livraison rapide</span>
                </a>
              </li>
              <li>
                <a href="#services" class="hover:text-white transition-colors flex items-center gap-2">
                  <i class="fa-solid fa-location-dot text-primary"></i>
                  <span>Suivi en temps réel</span>
                </a>
              </li>
              <li>
                <a href="#services" class="hover:text-white transition-colors flex items-center gap-2">
                  <i class="fa-solid fa-money-bill-wave text-primary"></i>
                  <span>Paiement COD</span>
                </a>
              </li>
              <li>
                <a routerLink="/tracking" class="hover:text-white transition-colors flex items-center gap-2">
                  <i class="fa-solid fa-magnifying-glass text-primary"></i>
                  <span>Suivre un colis</span>
                </a>
              </li>
            </ul>
          </div>

          <!-- Entreprise -->
          <div>
            <h3 class="text-white font-semibold mb-4">Entreprise</h3>
            <ul class="space-y-2 text-sm">
              <li>
                <a href="#why-dioks" class="hover:text-white transition-colors flex items-center gap-2">
                  <i class="fa-solid fa-circle-info text-primary"></i>
                  <span>À propos</span>
                </a>
              </li>
              <li>
                <a href="#how-it-works" class="hover:text-white transition-colors flex items-center gap-2">
                  <i class="fa-solid fa-circle-question text-primary"></i>
                  <span>Comment ça marche</span>
                </a>
              </li>
              <li>
                <a href="#testimonials" class="hover:text-white transition-colors flex items-center gap-2">
                  <i class="fa-solid fa-comment text-primary"></i>
                  <span>Témoignages</span>
                </a>
              </li>
              <li>
                <a routerLink="/register" class="hover:text-white transition-colors flex items-center gap-2">
                  <i class="fa-solid fa-handshake text-primary"></i>
                  <span>Devenir partenaire</span>
                </a>
              </li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h3 class="text-white font-semibold mb-4">Contact</h3>
            <ul class="space-y-3 text-sm">
              <li class="flex items-start gap-2">
                <i class="fa-solid fa-location-dot text-primary mt-0.5"></i>
                <span>Dakar, Sénégal</span>
              </li>
              <li class="flex items-start gap-2">
                <i class="fa-solid fa-phone text-primary mt-0.5"></i>
                <a href="tel:+221781082373" class="hover:text-white transition-colors">+221 78 108 23 73</a>
              </li>
              <li class="flex items-start gap-2">
                <i class="fa-solid fa-envelope text-primary mt-0.5"></i>
                <a href="mailto:dioks&#64;gmail.com" class="hover:text-white transition-colors">dioks&#64;gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom -->
        <div class="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-sm text-gray-400 flex items-center gap-2">
            <i class="fa-regular fa-copyright"></i>
            <span>{{ currentYear }} Dioks. Tous droits réservés.</span>
          </p>
          <div class="flex gap-6 text-sm">
            <a href="#" class="hover:text-white transition-colors flex items-center gap-1">
              <i class="fa-solid fa-file-contract text-primary"></i>
              <span>Conditions d'utilisation</span>
            </a>
            <a href="#" class="hover:text-white transition-colors flex items-center gap-1">
              <i class="fa-solid fa-shield-halved text-primary"></i>
              <span>Politique de confidentialité</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class PublicFooterComponent {
  currentYear = new Date().getFullYear();
}