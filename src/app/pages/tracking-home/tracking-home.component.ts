import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-tracking-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './tracking-home.component.html',
  styleUrls: ['./tracking-home.component.css']
})
export class TrackingHomeComponent {
  numeroTracking = '';

  constructor(
    private router: Router,
    private toastService: ToastService
  ) {}

  searchTracking() {
    const numero = this.numeroTracking.trim().toUpperCase();
    
    if (!numero) {
      this.toastService.error('Veuillez entrer un numéro de tracking');
      return;
    }

    // Rediriger vers la page de détail
    this.router.navigate(['/tracking', numero]);
  }
}