import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { Quartier } from '../../../core/models/auth.model';
import { StatutVendeur } from '../../../core/models/vendeur.model';
import { AuthHeaderComponent } from "../../../shared/components/auth-header/auth-header.component";
import { Zone } from '../../../core/models/livraison.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AuthHeaderComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  currentStep = 1;
  loading = false;
  errorMessage = '';
  
  communes: string[] = [];
  zones: Zone[] = [];
  
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
        Validators.pattern(/^\+?[0-9]{9,}$/)
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
      // Adresse en texte libre : commune/quartier ne sont plus imposés
      commune: [''],
      quartier: [''],
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
    this.loadZones();
  }

  loadZones() {
    this.apiService.getZones().subscribe({
      next: (zones) => {
        this.zones = zones;
        const allCommunes = zones.flatMap(z => z.communes);
        this.communes = [...new Set(allCommunes)].sort();
      },
      error: (error) => {
        console.error('❌ Erreur chargement zones:', error);
        this.communes = ['Dakar', 'Pikine', 'Guédiawaye', 'Rufisque'];
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
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
    return;
  }

  this.loading = true;
  this.errorMessage = '';

  this.authService.register(this.registerForm.value).subscribe({
    next: (response) => {
      console.log('✅ Inscription réussie:', response.user);

      // Vérifier statut après inscription
      if (response.user.statut === StatutVendeur.EN_ATTENTE_VALIDATION) {
        this.router.navigate(['/statut-compte']);
      } else {
        // Cas rare : compte directement actif
        this.router.navigate(['/vendeur/dashboard']);
      }

      this.loading = false;
    },
    error: (error) => {
      console.error('❌ Erreur inscription:', error);
      this.errorMessage = error.error?.message || 'Erreur lors de l\'inscription';
      this.loading = false;
    }
  });
}
}