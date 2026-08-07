import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;

  /** Libellés d'affichage des rôles (le Dispatcheur devient « Coordinateur Logistique »). */
  private readonly roleLabels: Record<string, string> = {
    VENDEUR: 'Vendeur',
    ADMIN: 'Administrateur',
    CLOSEUR: 'Closeur',
    LIVREUR: 'Livreur',
    DISPATCHEUR: 'Coordinateur Logistique'
  };

  get roleLabel(): string {
    const role = this.currentUser?.role;
    return role ? (this.roleLabels[role] ?? role) : '';
  }

  constructor(
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    public theme: ThemeService
  ) { }

  toggleTheme() {
    this.theme.toggle();
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout() {
    this.confirmationService.confirm({
      title: 'Se déconnecter',
      message: 'Êtes-vous sûr ?',
      type: 'warning',
      onConfirm: () => {
        this.authService.logout();
        this.toastService.success('Déconnexion réussie !');
      }
    });
  }
}