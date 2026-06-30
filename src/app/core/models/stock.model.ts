/**
 * Modèles du module Stock.
 */

export type TypeMouvement = 'ENTREE' | 'SORTIE' | 'AJUSTEMENT' | 'CREATION';

export interface Produit {
  id: number;
  code: string;
  nom: string;
  description?: string;
  vendeurId?: number;
  vendeurNom?: string;
  prixUnitaire?: number;
  quantiteStock: number;
  seuilAlerte: number;
  qrCodeUrl?: string;
  actif: boolean;
  enAlerte: boolean;
  dateCreation?: string;
}

export interface PageProduit {
  content: Produit[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateProduitRequest {
  nom: string;
  description?: string;
  vendeurId: number;
  prixUnitaire?: number;
  quantiteInitiale?: number;
  seuilAlerte?: number;
}

export interface UpdateProduitRequest {
  nom?: string;
  description?: string;
  prixUnitaire?: number;
  seuilAlerte?: number;
  actif?: boolean;
}

export interface CreateMonProduitRequest {
  nom: string;
  description?: string;
  prixUnitaire?: number;
  quantiteInitiale?: number;
  seuilAlerte?: number;
}

export interface MouvementStockRequest {
  quantite: number;
  commentaire?: string;
}

export interface AjustementStockRequest {
  quantite: number;
  commentaire?: string;
}

export interface Mouvement {
  id: number;
  type: TypeMouvement;
  variation: number;
  stockAvant: number;
  stockApres: number;
  livraisonId?: number;
  commentaire?: string;
  auteur?: string;
  dateMouvement?: string;
}
