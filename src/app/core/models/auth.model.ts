import { User } from "./user.model";

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
  commune: string;
  quartier: string;
  adresseComplete: string;
  pointRepere?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Quartier {
  id: number;
  nom: string;
  commune: string;
}