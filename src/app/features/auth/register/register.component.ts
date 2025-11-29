import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { Quartier } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  currentStep = 1;
  loading = false;
  errorMessage = '';
  
  communes = ['Dakar', 'Pikine', 'Guédiawaye', 'Rufisque'];
  quartiers: Quartier[] = [];
  filteredQuartiers: Quartier[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      // Étape 1: Infos personnelles
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['', [
        Validators.required,
        Validators.pattern(/^(77|78|76|70|75)\d{7}$/)
      ]],
      email: ['', [Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      
      // Étape 2: Infos boutique
      nomBoutique: [''],
      categorieActivite: [''],
      instagram: [''],
      facebook: [''],
      
      // Étape 3: Adresse
      commune: ['', Validators.required],
      quartier: ['', Validators.required],
      adresseComplete: ['', Validators.required],
      pointRepere: ['']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    // Charger les quartiers quand la commune change
    this.registerForm.get('commune')?.valueChanges.subscribe(commune => {
      if (commune) {
        this.loadQuartiers(commune);
      }
    });
  }

  loadQuartiers(commune: string) {
    this.apiService.getQuartiersByCommune(commune).subscribe({
      next: (quartiers) => {
        this.quartiers = quartiers;
        this.filteredQuartiers = quartiers;
      },
      error: (error) => {
        console.error('Erreur chargement quartiers:', error);
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formValue = this.registerForm.value;
    delete formValue.confirmPassword; // Ne pas envoyer confirmPassword

    this.authService.register(formValue).subscribe({
      next: (response) => {
        this.router.navigate(['/vendeur/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 409) {
          this.errorMessage = 'Ce numéro de téléphone est déjà utilisé';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }
}