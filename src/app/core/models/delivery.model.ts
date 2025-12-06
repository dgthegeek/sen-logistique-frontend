export interface DeliveryInfo {
  numeroTracking: string;
  client: {
    nom: string;
    telephone: string;
    adresse: string;
    pointRepere: string | null;
  };
  produit: {
    description: string;
    fragile: boolean;
  };
  vendeur: {
    nom: string;
  };
  montantACollecter: number;
}

export interface ConfirmLivraisonRequest {
  cashCollecte: number;
  colisRemis: boolean;
  commentaire?: string;
}

export interface ConfirmLivraisonResponse {
  message: string;
  numeroTracking: string;
}