import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService
  ) { }

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