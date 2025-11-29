import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
export class SidebarComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/vendeur/dashboard', icon: '📊' },
    { label: 'Nouvelle livraison', route: '/vendeur/creer-livraison', icon: '➕' },
    { label: 'Mes livraisons', route: '/vendeur/livraisons', icon: '📦' },
    { label: 'Mes finances', route: '/vendeur/finances', icon: '💰' },
  ];
}