import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
        // Redirection selon le rôle
        if (response.user.role === 'VENDEUR') {
          this.router.navigate(['/vendeur/dashboard']);
        } else if (response.user.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 401) {
          this.errorMessage = 'Téléphone ou mot de passe incorrect';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }

  get telephone() { return this.loginForm.get('telephone'); }
  get password() { return this.loginForm.get('password'); }
}