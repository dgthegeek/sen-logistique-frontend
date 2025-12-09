import { StatutVendeur } from "./vendeur.model";

export interface User {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;  // Optionnel
  role: 'VENDEUR' | 'ADMIN';
  nomBoutique?: string;  // Optionnel
  categorieActivite?: string;  
  statut?: StatutVendeur;
}