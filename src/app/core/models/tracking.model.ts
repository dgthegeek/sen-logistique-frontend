export interface TrackingInfo {
  numeroTracking: string;
  statut: 'EN_ATTENTE_RAMASSAGE' | 'RAMASSE' | 'EN_ROUTE' | 'LIVREE' | 'ECHEC_ABSENT' | 'ECHEC_REFUSE' | 'ANNULEE';
  destination: string;
  montantAPayer: number;
  timeline: TimelineStep[];
}

export interface TimelineStep {
  etape: 'COMMANDE_CREEE' | 'COLIS_RECUPERE' | 'EN_COURS_LIVRAISON' | 'LIVRE';
  date?: string;
  effectue: boolean;
}