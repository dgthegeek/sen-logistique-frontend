// src/app/shared/components/profil/profil.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfilService } from '../../../core/services/profile.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { ProfilResponse } from '../../../core/models/profile.model';
import { TelegramStatut } from '../../../core/models/telegram.model';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, SidebarComponent],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {
  profil: ProfilResponse | null = null;
  loading = false;
  isVendeur = false;

  profilForm!: FormGroup;
  passwordForm!: FormGroup;

  showPasswordModal = false;

  // Telegram
  telegram: TelegramStatut | null = null;
  telegramLoading = false;

  constructor(
    private profilService: ProfilService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private authService: AuthService,
    private api: ApiService
  ) {
    this.initForms();
  }

  ngOnInit() {
    this.isVendeur = this.authService.isVendeur();
    this.loadProfil();
    // Telegram disponible pour tous les rôles (chacun lie son propre compte)
    this.loadTelegram();
  }

  loadTelegram() {
    this.telegramLoading = true;
    this.api.getTelegramStatut().subscribe({
      next: (t) => { this.telegram = t; this.telegramLoading = false; },
      error: () => { this.telegramLoading = false; }
    });
  }

  ouvrirTelegram() {
    if (this.telegram?.deepLink) {
      window.open(this.telegram.deepLink, '_blank');
      this.toastService.info('Cliquez sur "Démarrer" dans Telegram, puis actualisez.');
    }
  }

  rafraichirTelegram() {
    this.loadTelegram();
  }

  delierTelegram() {
    this.telegramLoading = true;
    this.api.delierTelegram().subscribe({
      next: (t) => { this.telegram = t; this.telegramLoading = false; this.toastService.success('Compte Telegram délié'); },
      error: () => { this.telegramLoading = false; this.toastService.error('Action impossible'); }
    });
  }

  initForms() {
    this.profilForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      prenom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.email, Validators.maxLength(150)]],
      // Champs vendeur
      nomBoutique: ['', Validators.maxLength(200)],
      categorieActivite: ['', Validators.maxLength(100)],
      instagram: ['', Validators.maxLength(100)],
      facebook: ['', Validators.maxLength(200)],
      commune: ['', Validators.maxLength(100)],
      quartier: ['', Validators.maxLength(100)],
      adresseComplete: ['', Validators.maxLength(500)]
    });

    this.passwordForm = this.fb.group({
      ancienPassword: ['', [Validators.required, Validators.minLength(6)]],
      nouveauPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const nouveau = group.get('nouveauPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return nouveau === confirm ? null : { passwordMismatch: true };
  }

  loadProfil() {
    this.loading = true;
    this.profilService.getProfil().subscribe({
      next: (profil) => {
        this.profil = profil;
        this.profilForm.patchValue({
          nom: profil.nom,
          prenom: profil.prenom,
          email: profil.email,
          nomBoutique: profil.nomBoutique || '',
          categorieActivite: profil.categorieActivite || '',
          instagram: profil.instagram || '',
          facebook: profil.facebook || '',
          commune: profil.commune || '',
          quartier: profil.quartier || '',
          adresseComplete: profil.adresseComplete || ''
        });
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Erreur lors du chargement du profil');
        this.loading = false;
      }
    });
  }

  updateProfil() {
    if (this.profilForm.invalid) return;

    this.loading = true;
    this.profilService.updateProfil(this.profilForm.value).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.profil = response.profil;
        this.loading = false;
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Erreur lors de la mise à jour');
        this.loading = false;
      }
    });
  }

  openPasswordModal() {
    this.passwordForm.reset();
    this.showPasswordModal = true;
  }

  closePasswordModal() {
    this.showPasswordModal = false;
    this.passwordForm.reset();
  }

  changePassword() {
    if (this.passwordForm.invalid) return;

    const { ancienPassword, nouveauPassword } = this.passwordForm.value;
    this.loading = true;

    this.profilService.changePassword({ ancienPassword, nouveauPassword }).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.closePasswordModal();
        this.loading = false;
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Ancien mot de passe incorrect');
        this.loading = false;
      }
    });
  }

  getStatutBadgeClass(): string {
    if (!this.profil?.statut) return '';
    
    switch (this.profil.statut) {
      case 'ACTIF': return 'badge-success';
      case 'EN_ATTENTE_VALIDATION': return 'badge-warning';
      case 'SUSPENDU': return 'badge-error';
      case 'BLOQUE': return 'badge-error';
      default: return '';
    }
  }

  getStatutLabel(): string {
    if (!this.profil?.statut) return '';
    
    switch (this.profil.statut) {
      case 'ACTIF': return 'Actif';
      case 'EN_ATTENTE_VALIDATION': return 'En attente';
      case 'SUSPENDU': return 'Suspendu';
      case 'BLOQUE': return 'Bloqué';
      default: return '';
    }
  }
}