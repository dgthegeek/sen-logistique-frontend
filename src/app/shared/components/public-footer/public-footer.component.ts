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
                <span class="text-white font-bold">D</span>
              </div>
              <span class="text-xl font-bold text-white">Dioks</span>
            </div>
            <p class="text-sm text-gray-400 mb-4">
              La plateforme de livraison de confiance pour vos business.
            </p>
            <div class="flex gap-3">
              <a href="#" class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <span>📘</span>
              </a>
              <a href="#" class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <span>📸</span>
              </a>
              <a href="#" class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <span>🐦</span>
              </a>
            </div>
          </div>

          <!-- Services -->
          <div>
            <h3 class="text-white font-semibold mb-4">Services</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#services" class="hover:text-white transition-colors">Livraison rapide</a></li>
              <li><a href="#services" class="hover:text-white transition-colors">Suivi en temps réel</a></li>
              <li><a href="#services" class="hover:text-white transition-colors">Paiement COD</a></li>
              <li><a routerLink="/tracking" class="hover:text-white transition-colors">Suivre un colis</a></li>
            </ul>
          </div>

          <!-- Entreprise -->
          <div>
            <h3 class="text-white font-semibold mb-4">Entreprise</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#why-dioks" class="hover:text-white transition-colors">À propos</a></li>
              <li><a href="#how-it-works" class="hover:text-white transition-colors">Comment ça marche</a></li>
              <li><a href="#testimonials" class="hover:text-white transition-colors">Témoignages</a></li>
              <li><a routerLink="/register" class="hover:text-white transition-colors">Devenir partenaire</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h3 class="text-white font-semibold mb-4">Contact</h3>
            <ul class="space-y-3 text-sm">
              <li class="flex items-start gap-2">
                <span>📍</span>
                <span>Dakar, Sénégal</span>
              </li>
              <li class="flex items-start gap-2">
                <span>📞</span>
                <a href="tel:+221781082373" class="hover:text-white transition-colors">+221 78 108 23 73</a>
              </li>
              <li class="flex items-start gap-2">
                <span>📧</span>
                <a href="mailto:dioks&#64;gmail.com" class="hover:text-white transition-colors">dioks&#64;gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom -->
        <div class="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-sm text-gray-400">
            © {{ currentYear }} Dioks. Tous droits réservés.
          </p>
          <div class="flex gap-6 text-sm">
            <a href="#" class="hover:text-white transition-colors">Conditions d'utilisation</a>
            <a href="#" class="hover:text-white transition-colors">Politique de confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class PublicFooterComponent {
  currentYear = new Date().getFullYear();
}