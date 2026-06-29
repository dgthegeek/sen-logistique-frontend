export interface Zone {
  id: number;
  nom: string;
  communes: string[];
  tarifBase: number;
}

export interface Quartier {
  id: number;
  nom: string;
  commune: string;
}

export interface CalculTarifRequest {
  zoneId: number;
  communeDepart: string;
  quartierDepart: string;
  communeDestination: string;
  quartierDestination: string;
  montantCOD: number;
  urgence: 'NORMAL' | 'EXPRESS';
}

export interface CalculTarifResponse {
  montant: number;           // ← Frais de livraison
  zone: string;
  urgence: 'NORMAL' | 'EXPRESS';
  delaiEstime?: string;      // ← Optionnel
  detailCalcul: {
    tarifBase: number;
    supplementPoids: number;
    supplementUrgence: number;
  };
}

export interface CreateLivraisonRequest {
  telephoneVendeur?: string;  
  // Infos client
  nomClient: string;
  telephoneClient: string;
  commune: string;
  quartier: string;
  adresseComplete: string;
  pointRepere?: string;
  
  // Infos colis
  descriptionProduit: string;
  produitId?: number;   // Produit du stock lié (optionnel) - décrément auto à la livraison
  quantite?: number;    // Quantité commandée du produit lié
  fragile: boolean;
  poids?: number;
  montantCOD: number;
  zoneId: number;
  urgence: 'NORMAL' | 'EXPRESS';
  creneauSouhaite?: 'MATIN' | 'APRES_MIDI' | 'SOIR';
  notesPourLivreur?: string;
}

export interface CreateLivraisonResponse {
  id: number;
  numeroTracking: string;
  qrCodeUrl: string;
  statut: StatutLivraison;
  dateCreation: string;
  fraisLivraison: number;
  montantCOD: number;
  montantARecevoir: number;
  message: string;
}

export type StatutLivraison =
  // Nouveau cycle (Closing + Dispatch)
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

// Pour la liste (GET /vendeur/livraisons)
export interface LivraisonResume {
  id: number;
  numeroTracking: string;
  qrCodeUrl: string;
  statut: StatutLivraison;
  dateCreation: string;
  fraisLivraison: number;
  montantCOD: number;
  montantARecevoir: number;
  message: string;
}

// Pour le détail (GET /vendeur/livraisons/{id})
export interface LivraisonDetail {
  id: number;
  numeroTracking: string;
  qrCodeUrl: string;
  statut: StatutLivraison;
  dateCreation: string;
  dateRamassage: string | null;
  dateLivraison: string | null;
  vendeur: {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
    nomBoutique: string;
  };
  client: {
    nom: string;
    telephone: string;
    adresse: string;
    pointRepere: string | null;
  };
  produit: {
    description: string;
    fragile: boolean;
    poids: number | null;
  };
  financier: {
    montantCOD: number;
    fraisLivraison: number;
    cashCollecte: number | null;
  };
  zone: string;
  urgence: 'NORMAL' | 'EXPRESS';
  commentaireLivraison: string | null;
}

// Response paginée
export interface LivraisonsResponse {
  content: LivraisonResume[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface LivraisonFilters {
  statut?: StatutLivraison;
  dateDebut?: string;
  dateFin?: string;
  search?: string;
}