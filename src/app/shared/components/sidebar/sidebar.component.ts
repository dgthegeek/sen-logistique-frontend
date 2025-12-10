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

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    
    if (this.isAdmin) {
      this.menuItems = [
        { label: 'Dashboard', route: '/admin/dashboard', icon: '📊' },
        { label: 'Ramassages', route: '/admin/ramassages', icon: '📦' },
        { label: 'Livraisons', route: '/admin/livraisons', icon: '🚚' },
        { label: 'Finances', route: '/admin/finances', icon: '💰' },
        { label: 'Gestion vendeurs', route: '/admin/vendeurs', icon: '👥' }, 
      ];
    } else {
      this.menuItems = [
        { label: 'Dashboard', route: '/vendeur/dashboard', icon: '📊' },
        { label: 'Nouvelle livraison', route: '/vendeur/creer-livraison', icon: '➕' },
        { label: 'Mes livraisons', route: '/vendeur/livraisons', icon: '📦' },
        { label: 'Mes finances', route: '/vendeur/finances', icon: '💰' },
      ];
    }
  }
}