import { StatutVendeur } from "./vendeur.model";

export type UserRole = 'VENDEUR' | 'ADMIN' | 'CLOSEUR' | 'LIVREUR';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;  // Optionnel
  role: UserRole;
  nomBoutique?: string;  // Optionnel
  categorieActivite?: string;  
  statut?: StatutVendeur;
}