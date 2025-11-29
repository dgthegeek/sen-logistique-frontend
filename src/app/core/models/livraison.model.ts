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
  fraisLivraison: number;
  montantARecevoir: number;
  zone: string;
  delaiEstime: string;
}

export interface CreateLivraisonRequest {
  // Infos client
  nomClient: string;
  telephoneClient: string;
  commune: string;
  quartier: string;
  adresseComplete: string;
  pointRepere?: string;
  
  // Infos colis
  descriptionProduit: string;
  fragile: boolean;
  poidsEstime?: number;
  montantCOD: number;
  urgence: 'NORMAL' | 'EXPRESS';
  notesLivreur?: string;
}

export interface CreateLivraisonResponse {
  id: number;
  numeroTracking: string;
  qrCodeUrl: string;
  statut: string;
  fraisLivraison: number;
  montantARecevoir: number;
  dateCreation: Date;
}

export interface CreateLivraisonRequest {
  // Infos client
  nomClient: string;
  telephoneClient: string;
  commune: string;
  quartier: string;
  adresseComplete: string;
  pointRepere?: string;
  
  // Infos colis
  descriptionProduit: string;
  fragile: boolean;
  poids?: number;  
  montantCOD: number;
  zoneId: number; 
  urgence: 'NORMAL' | 'EXPRESS';
  creneauSouhaite?: 'MATIN' | 'APRES_MIDI' | 'SOIR';  // Optionnel
  notesPourLivreur?: string;  
}

export interface Livraison {
  id: number;
  numeroTracking: string;
  vendeurId: number;
  
  // Client
  nomClient: string;
  telephoneClient: string;
  commune: string;
  quartier: string;
  adresseComplete: string;
  pointRepere?: string;
  
  // Colis
  descriptionProduit: string;
  fragile: boolean;
  poids?: number;
  montantCOD: number;
  
  // Livraison
  statut: StatutLivraison;
  urgence: 'NORMAL' | 'EXPRESS';
  fraisLivraison: number;
  montantARecevoir: number;
  
  // Dates
  dateCreation: string;
  dateRamassage?: string;
  dateLivraison?: string;
  
  // QR Code
  qrCodeUrl?: string;
  
  // Notes
  notesPourLivreur?: string;
  commentaireLivreur?: string;
  
  // Zone
  zoneId: number;
  zone?: {
    id: number;
    nom: string;
  };
}

export type StatutLivraison = 
  | 'EN_ATTENTE_RAMASSAGE'
  | 'RAMASSE'
  | 'EN_ROUTE'
  | 'LIVREE'
  | 'ECHEC_ABSENT'
  | 'ECHEC_REFUSE'
  | 'ANNULEE';

export interface LivraisonsResponse {
  content: Livraison[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface LivraisonFilters {
  statut?: StatutLivraison;
  dateDebut?: string;
  dateFin?: string;
  search?: string;
}