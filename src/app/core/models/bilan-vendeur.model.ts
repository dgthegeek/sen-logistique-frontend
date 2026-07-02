/** Bilan d'un vendeur : stock actuel + ventes sur une période. */
export interface BilanVendeurLigne {
  produitId: number;
  code: string;
  nom: string;
  prixUnitaire?: number;
  stockActuel: number;
  quantiteVendue: number;
  montantVentes: number;
  enAlerte?: boolean;
}

export interface BilanVendeur {
  vendeur: {
    id: number;
    nom: string;
    prenom: string;
    nomBoutique?: string;
    telephone?: string;
  };
  periodeDebut: string;
  periodeFin: string;
  genereLe?: string;
  lignes: BilanVendeurLigne[];
  nombreProduits: number;
  totalStock: number;
  totalQuantiteVendue: number;
  totalMontantVentes: number;
}
