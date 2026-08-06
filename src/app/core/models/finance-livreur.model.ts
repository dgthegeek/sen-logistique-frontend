/**
 * Modèles pour la finance des livreurs : cash (COD) collecté à reverser au
 * coordinateur logistique / à l'admin.
 */

/** Situation financière d'un livreur (vue coordinateur/admin). */
export interface LivreurSolde {
  livreurId: number;
  nom: string;
  prenom: string;
  telephone: string;
  soldeARegler: number;
  nombreLivraisonsNonReglees: number;
  totalCollecte: number;
  totalVerse: number;
}

/** Trace d'un versement de cash effectué par un livreur. */
export interface VersementLivreur {
  id: number;
  livreurId: number;
  livreurNom: string;
  montant: number;
  nombreLivraisons: number;
  dateVersement: string;
  effectuePar?: string;
  effectueParRole?: string;
  commentaire?: string;
}

export interface PageVersement {
  content: VersementLivreur[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Vue financière du livreur pour lui-même. */
export interface LivreurFinances {
  totalCollecte: number;
  totalVerse: number;
  soldeARegler: number;
  nombreLivraisons: number;
  nombreLivraisonsNonReglees: number;
  versements: VersementLivreur[];
}
