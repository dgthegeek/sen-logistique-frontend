/** Solde à verser à un vendeur (partenaire), pour l'écran admin Finance partenaires. */
export interface PartenaireSolde {
  vendeurId: number;
  nom: string;
  prenom: string;
  nomBoutique?: string;
  telephone: string;
  soldeAPayer: number;
  chiffreAffaires: number;
  totalPaye: number;
}
