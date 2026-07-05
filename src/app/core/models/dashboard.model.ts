export interface VendeurDashboard {
  statistiquesJour: {
    totalColis: number;
    colisLivres: number;
    colisEnCours: number;
    colisEchecs: number;
  };
  finances: {
    soldeEnAttente: number;
    chiffreAffaires?: number;
    prochainPaiement: string;
  };
  dernieresLivraisons: LivraisonResume[];
}

export interface LivraisonResume {
  id: number;
  numeroTracking: string;
  nomClient: string;
  destination: string;
  montantCOD: number;
  statut: StatutLivraison;
  dateCreation: Date;
}

export type StatutLivraison = 
  | 'EN_ATTENTE_RAMASSAGE'
  | 'RAMASSE'
  | 'EN_ROUTE'
  | 'LIVREE'
  | 'ECHEC_ABSENT'
  | 'ECHEC_REFUSE'
  | 'ANNULEE';

  