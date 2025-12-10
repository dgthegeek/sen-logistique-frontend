import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { AuthHeaderComponent } from "../../shared/components/auth-header/auth-header.component";

@Component({
  selector: 'app-tracking-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AuthHeaderComponent],
  templateUrl: './tracking-home.component.html',
  styleUrls: ['./tracking-home.component.css']
})
export class TrackingHomeComponent {
  trackingNumber = '';
  loading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private toastService: ToastService
  ) {}

  onSearch(event: Event) {
    event.preventDefault();
    
    // Reset error message
    this.errorMessage = '';
    
    const numero = this.trackingNumber.trim().toUpperCase();
    
    if (!numero) {
      this.errorMessage = 'Veuillez entrer un numéro de tracking';
      return;
    }

    // Validation du format (optionnel)
    const trackingPattern = /^DKR-\d{8}-\d{5}$/;
    if (!trackingPattern.test(numero)) {
      this.errorMessage = 'Format de numéro invalide. Format attendu: DKR-20250101-00001';
      return;
    }

    // Simulate loading
    this.loading = true;

    // Rediriger vers la page de détail
    setTimeout(() => {
      this.router.navigate(['/tracking', numero]);
      this.loading = false;
    }, 300);
  }
}