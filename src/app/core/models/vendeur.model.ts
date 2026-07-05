// ============================================
// ENUMS
// ============================================

export enum StatutVendeur {
  EN_ATTENTE_VALIDATION = 'EN_ATTENTE_VALIDATION',
  ACTIF = 'ACTIF',
  SUSPENDU = 'SUSPENDU',
  BLOQUE = 'BLOQUE'
}

// ============================================
// VENDEUR DTOs
// ============================================

export interface VendeurDTO {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  nomBoutique?: string;
  categorieActivite?: string;
  instagram?: string;
  facebook?: string;
  commune?: string;
  quartier?: string;
  adresseComplete?: string;
  statut: StatutVendeur;
  dateInscription: string;
  valideLe?: string;
  soldeEnAttente: number;
  raisonSuspension?: string;
  commissionFixe?: number;
}

export interface VendeurDetailDTO {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  nomBoutique?: string;
  categorieActivite?: string;
  instagram?: string;
  facebook?: string;
  commune?: string;
  quartier?: string;
  adresseComplete?: string;
  statut: StatutVendeur;
  dateInscription: string;
  valideLe?: string;
  soldeEnAttente: number;
  raisonSuspension?: string;
  commissionFixe?: number;
  validePar?: {
    id: number;
    nom: string;
    prenom: string;
  };
  statistiques: {
    nombreLivraisons: number;
    nombreLivraisonsReussies: number;
    nombreEnCours: number;
    tauxReussite: number;
    chiffreAffairesTotal: number;
    derniereActivite?: string;
  };
}

export interface PageVendeur {
  content: VendeurDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ============================================
// ADMIN VENDEURS - RESPONSE DTOs
// ============================================

export interface AdminVendeursEnAttenteResponse {
  vendeurs: VendeurDTO[];
  total: number;
}

export interface AdminVendeurActionResponse {
  message: string;
  vendeur: VendeurDTO;
}

// ============================================
// ADMIN VENDEURS - REQUEST DTOs
// ============================================

export interface SuspendreVendeurRequest {
  raison: string;
}

export interface BloquerVendeurRequest {
  raison: string;
}

// ============================================
// FILTRES
// ============================================

export interface VendeurFilters {
  statut?: StatutVendeur;
  quartier?: string;
  commune?: string;
  search?: string;
  sort?: 'dateInscription' | 'nombreLivraisons' | 'chiffreAffaires';
  order?: 'asc' | 'desc';
}