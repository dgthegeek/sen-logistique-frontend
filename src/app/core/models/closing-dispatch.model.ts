import { UserRole } from './user.model';

/**
 * Modèles des modules Closing & Dispatch.
 */

export type StatutLivraison =
  | 'NOUVELLE'
  | 'A_APPELER'
  | 'CONFIRMEE'
  | 'PRETE_A_LIVRER'
  | 'ASSIGNEE'
  | 'EN_LIVRAISON'
  | 'LIVREE'
  | 'ECHEC'
  | 'ANNULEE'
  // Ancien cycle (ramassage - dormant)
  | 'EN_ATTENTE_RAMASSAGE'
  | 'RAMASSE'
  | 'EN_ROUTE'
  | 'ECHEC_ABSENT'
  | 'ECHEC_REFUSE';

export type MotifEchec =
  | 'TELEPHONE_INJOIGNABLE'
  | 'CLIENT_ABSENT'
  | 'ADRESSE_INCORRECTE'
  | 'REFUS_CLIENT'
  | 'REPORT_CLIENT';

/** Commande vue par le closeur. */
export interface CommandeCloseur {
  id: number;
  numeroTracking: string;
  statut: StatutLivraison;
  nomClient: string;
  telephoneClient: string;
  adresse?: string;
  zone?: string;
  produit?: string;
  montantCOD: number;
  dateCreation?: string;
}

/** Commande prête à livrer, vue par l'admin pour assignation. */
export interface CommandeDispatch {
  id: number;
  numeroTracking: string;
  nomClient: string;
  telephoneClient: string;
  adresse?: string;
  zone?: string;
  produit?: string;
  montantCOD: number;
}

/** Livraison vue par le livreur (Mes livraisons). */
export interface CommandeLivreur {
  id: number;
  numeroTracking: string;
  statut: StatutLivraison;
  nomClient: string;
  telephoneClient: string;
  adresse?: string;
  pointRepere?: string;
  zone?: string;
  produit?: string;
  montantAEncaisser: number;
}

/** Compte d'un membre de l'équipe (closeur ou livreur). */
export interface MembreResponse {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  role: UserRole;
  actif: boolean;
}

export interface LivreurResponse {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  zonePreferee?: string;
  actif: boolean;
  nombreLivraisonsEnCours?: number;
}

export interface CreateMembreRequest {
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  password: string;
  zonePreferee?: string;
}

export interface AssignerLivreurRequest {
  livraisonIds: number[];
  livreurId: number;
}

export interface AssignerLivreurResponse {
  message: string;
  nombreAssignees: number;
}

export interface LivrerRequest {
  cashCollecte: number;
  commentaire?: string;
}

export interface EchecRequest {
  motif: MotifEchec;
  commentaire?: string;
}
