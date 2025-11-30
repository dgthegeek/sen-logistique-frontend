export interface VendeurFinances {
  soldeEnAttente: number;
  statistiquesMois: {
    nombreLivraisons: number;
    caGenere: number;
    fraisLivraison: number;
  };
  historiquePaiements: HistoriquePaiement[];
}

export interface HistoriquePaiement {
  date: string;
  montant: number;
  reference: string;
  statut: 'EFFECTUE' | 'EN_ATTENTE' | 'ANNULE';
}

export interface DemandePaiement {
  // Pas de body requis selon l'API
}

export interface DemandePaiementResponse {
  message: string;
  montant: number;
}