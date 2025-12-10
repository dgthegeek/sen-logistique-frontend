import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { StatutVendeur } from '../../../core/models/vendeur.model';
import { AuthHeaderComponent } from "../../../shared/components/auth-header/auth-header.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AuthHeaderComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      telephone: ['', [
        Validators.required,
        Validators.pattern(/^(77|78|76|70|75)\d{7}$/)
      ]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
  if (this.loginForm.invalid) {
    return;
  }

  this.loading = true;
  this.errorMessage = '';

  const { telephone, password } = this.loginForm.value;

  this.authService.login(telephone, password).subscribe({
    next: (response) => {
      console.log('✅ Login réussi:', response.user);
      console.log('📋 Rôle:', response.user.role);
      console.log('📋 Statut:', response.user.statut);
      console.log('📋 Type statut:', typeof response.user.statut);

      // Redirection selon rôle ET statut
      if (response.user.role === 'ADMIN') {
        console.log('➡️ Redirection admin...');
        this.router.navigate(['/admin/dashboard']);
      } else {
        console.log('➡️ Traitement vendeur...');
        
        // Vérifier statut vendeur
        if (response.user.statut === StatutVendeur.EN_ATTENTE_VALIDATION) {
          console.log('➡️ Redirection en attente validation...');
          this.router.navigate(['/en-attente-validation']);
        } else if (response.user.statut === 'SUSPENDU' || response.user.statut === 'BLOQUE') {
          console.log('➡️ Redirection compte suspendu...');
          this.router.navigate(['vendeur/compte-suspendu']);
        } else {
          console.log('➡️ Redirection dashboard vendeur...');
          this.router.navigate(['/vendeur/dashboard']);
        }
      }

      this.loading = false;
    },
    error: (error) => {
      console.error('❌ Erreur login:', error);
      this.errorMessage = error.error?.message || 'Identifiants incorrects';
      this.loading = false;
    }
  });
}

  get telephone() { return this.loginForm.get('telephone'); }
  get password() { return this.loginForm.get('password'); }
}