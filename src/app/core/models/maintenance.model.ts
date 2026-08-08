/** Modèles pour l'écran de maintenance (suppression de données). */

export interface MaintenanceResult {
  message: string;
}

export interface VendeurImpact {
  vendeurId: number;
  nom: string;
  livraisons: number;
  transactions: number;
  produits: number;
}

export interface SuppressionVendeurResult {
  message: string;
  livraisonsSupprimees: number;
  transactionsSupprimees: number;
  produitsSupprimes: number;
}
