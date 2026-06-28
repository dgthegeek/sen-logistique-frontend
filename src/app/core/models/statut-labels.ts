import { StatutLivraison } from './closing-dispatch.model';

/**
 * Libellés français des statuts de livraison (nouveau cycle Closing/Dispatch
 * + anciens statuts ramassage conservés pour l'historique).
 */
export const STATUT_LABELS: Record<StatutLivraison, string> = {
  NOUVELLE: 'Nouvelle commande',
  A_APPELER: 'À appeler',
  CONFIRMEE: 'Confirmée',
  PRETE_A_LIVRER: 'Prête à livrer',
  ASSIGNEE: 'Assignée',
  EN_LIVRAISON: 'En livraison',
  LIVREE: 'Livrée',
  ECHEC: 'Échec',
  ANNULEE: 'Annulée',
  // Ancien cycle (dormant)
  EN_ATTENTE_RAMASSAGE: 'En attente de ramassage',
  RAMASSE: 'Ramassé',
  EN_ROUTE: 'En route',
  ECHEC_ABSENT: 'Échec - absent',
  ECHEC_REFUSE: 'Échec - refusé'
};

export const MOTIF_ECHEC_LABELS: Record<string, string> = {
  TELEPHONE_INJOIGNABLE: 'Téléphone injoignable',
  CLIENT_ABSENT: 'Client absent',
  ADRESSE_INCORRECTE: 'Adresse incorrecte',
  REFUS_CLIENT: 'Refus client',
  REPORT_CLIENT: 'Report client'
};
