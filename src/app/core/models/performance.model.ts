export interface PerfCloseur {
  id: number;
  nom: string;
  prenom: string;
  nombrePrisEnCharge: number;
  nombrePretes: number;
  tempsMoyenPriseEnChargeMin: number;
  tempsMoyenClosingMin: number;
}

export interface PerfDispatcheur {
  id: number;
  nom: string;
  prenom: string;
  nombreDispatchees: number;
  tempsMoyenDispatchMin: number;
}

export interface PerfLivreur {
  id: number;
  nom: string;
  prenom: string;
  nombreLivrees: number;
  nombreEchecs: number;
  tauxReussite: number;
  tempsMoyenLivraisonMin: number;
}

export interface PerformanceResponse {
  periode: string;
  tempsMoyenPriseEnChargeMin: number;
  tempsMoyenDispatchMin: number;
  tempsMoyenLivraisonMin: number;
  totalLivrees: number;
  totalEchecs: number;
  closeurs: PerfCloseur[];
  dispatcheurs: PerfDispatcheur[];
  livreurs: PerfLivreur[];
}
