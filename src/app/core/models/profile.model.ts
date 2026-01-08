// src/app/core/models/profil.model.ts

export interface ProfilResponse {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  role: 'VENDEUR' | 'ADMIN';
  dateInscription: string;
  // Champs spécifiques vendeur (null si admin)
  nomBoutique?: string;
  categorieActivite?: string;
  instagram?: string;
  facebook?: string;
  commune?: string;
  quartier?: string;
  adresseComplete?: string;
  statut?: 'EN_ATTENTE_VALIDATION' | 'ACTIF' | 'SUSPENDU' | 'BLOQUE';
  soldeEnAttente?: number;
}

export interface UpdateProfilRequest {
  nom: string;
  prenom: string;
  email: string;
  // Champs spécifiques vendeur (ignorés si admin)
  nomBoutique?: string;
  categorieActivite?: string;
  instagram?: string;
  facebook?: string;
  commune?: string;
  quartier?: string;
  adresseComplete?: string;
}

export interface ChangePasswordRequest {
  ancienPassword: string;
  nouveauPassword: string;
}

export interface ProfilUpdateResponse {
  message: string;
  profil: ProfilResponse;
}

export interface PasswordChangeResponse {
  message: string;
}