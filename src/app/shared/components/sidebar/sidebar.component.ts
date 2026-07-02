import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [];
  isAdmin = false;
  isMobileMenuOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();

    if (this.isAdmin) {
      this.menuItems = [
        { label: 'Tableau de bord', route: '/admin/stats', icon: 'fa-solid fa-chart-line' },
        { label: 'Créer une commande', route: '/admin/creer-livraison-vendeur', icon: 'fa-solid fa-truck-fast' },
        { label: 'Livraisons', route: '/admin/livraisons', icon: 'fa-solid fa-truck' },
        { label: 'Dispatch livreurs', route: '/admin/dispatch', icon: 'fa-solid fa-truck-arrow-right' },
        { label: 'Équipe', route: '/admin/equipe', icon: 'fa-solid fa-users-gear' },
        { label: 'Finances', route: '/admin/finances', icon: 'fa-solid fa-money-bill-trend-up' },
        { label: 'Bilan partenaires', route: '/admin/bilan', icon: 'fa-solid fa-file-invoice' },
        { label: 'Dioks League', route: '/admin/classement', icon: 'fa-solid fa-trophy' },
        { label: 'Stock & produits', route: '/admin/stock', icon: 'fa-solid fa-boxes-stacked' },
        { label: 'Gestion vendeurs', route: '/admin/vendeurs', icon: 'fa-solid fa-store' },
        { label: 'Zones de livraison', route: '/admin/zones', icon: 'fa-solid fa-map-location-dot' },
        { label: 'Mon compte', route: '/admin/profil', icon: 'fa-solid fa-user-gear' },
        { label: 'Impression QR', route: '/admin/impression-qr', icon: 'fa-solid fa-qrcode' }
      ];
    } else if (this.authService.isCloseur()) {
      this.menuItems = [
        { label: 'Commandes', route: '/closeur/commandes', icon: 'fa-solid fa-headset' },
        { label: 'Mon compte', route: '/closeur/profil', icon: 'fa-solid fa-user-gear' },
      ];
    } else if (this.authService.isLivreur()) {
      this.menuItems = [
        { label: 'Mes livraisons', route: '/livreur/mes-livraisons', icon: 'fa-solid fa-motorcycle' },
        { label: 'Mon compte', route: '/livreur/profil', icon: 'fa-solid fa-user-gear' },
      ];
    } else if (this.authService.isDispatcheur()) {
      this.menuItems = [
        { label: 'Dispatch', route: '/dispatcheur/dispatch', icon: 'fa-solid fa-truck-arrow-right' },
        { label: 'Mon compte', route: '/dispatcheur/profil', icon: 'fa-solid fa-user-gear' },
      ];
    } else {
      this.menuItems = [
        { label: 'Dashboard', route: '/vendeur/dashboard', icon: 'fa-solid fa-chart-pie' },
        { label: 'Nouvelle livraison', route: '/vendeur/creer-livraison', icon: 'fa-solid fa-circle-plus' },
        { label: 'Mes livraisons', route: '/vendeur/livraisons', icon: 'fa-solid fa-boxes-stacked' },
        { label: 'Mon stock', route: '/vendeur/mon-stock', icon: 'fa-solid fa-warehouse' },
        { label: 'Mon bilan', route: '/vendeur/bilan', icon: 'fa-solid fa-file-invoice' },
        { label: 'Dioks League', route: '/vendeur/classement', icon: 'fa-solid fa-trophy' },
        { label: 'Mes finances', route: '/vendeur/finances', icon: 'fa-solid fa-wallet' },
        { label: 'Mon compte', route: '/vendeur/profil', icon: 'fa-solid fa-user-circle' },
      ];
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}