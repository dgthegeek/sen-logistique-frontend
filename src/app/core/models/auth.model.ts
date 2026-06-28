import { User, UserRole } from "./user.model";

export interface LoginRequest {
  telephone: string;
  password: string;
}

export interface Quartier {
  id: number;
  nom: string;
  commune: string;
}

import { StatutVendeur } from './vendeur.model';

export interface LoginRequest {
  telephone: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  password: string;
  nomBoutique?: string;
  categorieActivite?: string;
  instagram?: string;
  facebook?: string;
  commune?: string;
  quartier?: string;
  adresseComplete?: string;
  pointRepere?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  type: string;
  user: UserInfo;
}

export interface UserInfo {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  role: UserRole;
  nomBoutique?: string;
  commune?: string;
  quartier?: string;
  adresseComplete?: string;
  statut?: StatutVendeur; // ← NOUVEAU CHAMP
}