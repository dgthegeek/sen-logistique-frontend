export interface RamassagesToday {
  zones: RamassageZone[];
  totalColis: number;
}

export interface LivraisonsALivrer {
  zones: {
    zone: string;
    nombreColis: number;
    colis: any[];  // ou un type plus précis si besoin
  }[];
  totalColis: number;
}

export interface ActiviteRecente {
  id: number;
  type: 'RAMASSAGE' | 'LIVRAISON' | 'PAIEMENT';
  description: string;
  date: string;
  statut: string;
}

export interface RamassageVendeur {
  vendeurId: number;
  nom: string;
  prenom: string;
  telephone: string;
  nomBoutique: string;
  commune: string;
  quartier: string;
  adresseComplete: string;
  pointRepere: string | null;
  nombreColis: number;
  colis: RamassageColis[];
}


export interface MarquerRamasseRequest {
  livraisonIds: number[];
}

export interface LivraisonAdmin {
  id: number;
  numeroTracking: string;
  qrCodeUrl: string;
  statut: string;
  montantCOD: number;
  fraisLivraison: number;
  montantARecevoir: number;
  dateCreation: string;
  message: string;
}

export interface LivraisonsAdminResponse {
  content: LivraisonAdmin[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ConfirmerLivraisonRequest {
  cashCollecte: number;
  colisRemis: boolean;
  commentaire?: string;
}

export interface ConfirmerLivraisonResponse {
  message: string;
  numeroTracking: string;
  montantCollecte: number;
}

export interface AdminFinances {
  cashEnCaisse: number;
  paiementsEnAttente: {
    nombreVendeurs: number;
    montantTotal: number;
  };
  demandesPaiement: DemandePaiementAdmin[];
  historiquePaiements: HistoriquePaiementAdmin[];
}

export interface DemandePaiementAdmin {
  id: number;
  vendeur: {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
    nomBoutique: string;
  };
  montant: number;
  dateCreation: string;
  statut: 'EN_ATTENTE' | 'APPROUVE' | 'REFUSE';
}

export interface HistoriquePaiementAdmin {
  id: number;
  vendeur: {
    nom: string;
    prenom: string;
    nomBoutique: string;
  };
  montant: number;
  date: string;
  reference: string;
  statut: 'EFFECTUE' | 'EN_ATTENTE' | 'ANNULE';
}

export interface TraiterPaiementRequest {
  demandePaiementId: number;
  approuve: boolean;
  commentaire?: string;
}

export interface TraiterPaiementResponse {
  message: string;
  montant: number;
}

// ========== DASHBOARD ADMIN (Composé) ==========

export interface AdminFinancesDashboard {
  cashCollecte: number;
  aPayerVendeurs: number;
  commissions: number;
  statistiques: {
    nombreLivraisons: number;
    nombreVendeurs: number;
    tauxReussite: number;
  };
}

export interface DemandePaiementPending {
  id: number;
  vendeur: {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
    nomBoutique: string;
  };
  montant: number;
  nombreLivraisons: number;
  dateDemande: string;
}

export interface PaiementsPending {
  demandes: DemandePaiementPending[];
  totalAPayer: number;
}

export interface PayerVendeurRequest {
  montant: number;
  commentaire?: string;
}

export interface PayerVendeurResponse {
  message: string;
  reference: string;
}

export interface TransactionAdmin {
  id: number;
  vendeur: string;
  montant: number;
  type: 'PAIEMENT_VENDEUR' | 'LIVRAISON' | 'COMMISSION';
  reference: string;
  statut: 'EFFECTUE' | 'EN_ATTENTE' | 'ANNULE';
  date: string;
}

export interface TransactionsResponse {
  content: TransactionAdmin[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AdminFinances {
  dashboard: AdminFinancesDashboard;
  paiementsPending: PaiementsPending;
  transactions: TransactionAdmin[];
}

export interface AdminDashboard {
  finances: AdminFinancesDashboard;
  ramassages: RamassagesToday;
  livraisons: LivraisonsALivrer;
  paiements: PaiementsPending;
}

export interface RamassageZone {
  zone: string; // ← STRING, pas un objet
  nombreColis: number;
  vendeurs: RamassageVendeur[];
}

export interface RamassageVendeur {
  id: number; // ← id, pas vendeurId
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string; // ← adresse simple, pas adresseComplete
  nombreColis: number;
  colis: RamassageColis[];
}

export interface RamassageColis {
  id: number;
  numeroTracking: string;
  nomClient: string; // ← STRING, pas objet client
  descriptionProduit?: string;
  fragile?: boolean;
  urgence?: 'NORMAL' | 'EXPRESS';
}

export interface RamassagesTodayResponse {
  zones: RamassageZone[];
  totalColis: number;
}