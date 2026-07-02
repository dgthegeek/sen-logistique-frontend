export type Tier = 'BRONZE' | 'ARGENT' | 'OR' | 'PLATINE' | 'DIAMANT' | 'LEGENDE';

export interface ClassementEntry {
  vendeurId: number;
  rang: number;
  nomAffiche: string;
  nombreLivraisons: number;
  chiffreAffaires?: number | null;
  tier: Tier;
  moi?: boolean;
  participe?: boolean;
}

export interface ClassementResponse {
  participe: boolean;
  totalParticipants: number;
  monRang?: number | null;
  monTier?: Tier | null;
  mesLivraisons: number;
  monChiffreAffaires?: number | null;
  prochainTier?: Tier | null;
  livraisonsPourProchainTier?: number | null;
  progressionPourcent: number;
  entries: ClassementEntry[];
}

export interface TierMeta {
  key: Tier;
  label: string;
  emoji: string;
  seuil: number;
  from: string;
  to: string;
  glow: string;
}

/** Ordre croissant des paliers + métadonnées visuelles. */
export const TIERS: TierMeta[] = [
  { key: 'BRONZE',  label: 'Bronze',  emoji: '🥉', seuil: 0,   from: '#c08457', to: '#7a4f28', glow: 'rgba(192,132,87,.55)' },
  { key: 'ARGENT',  label: 'Argent',  emoji: '🥈', seuil: 15,  from: '#d3dae6', to: '#8a94a6', glow: 'rgba(180,190,205,.6)' },
  { key: 'OR',      label: 'Or',      emoji: '🥇', seuil: 40,  from: '#ffe082', to: '#d4a017', glow: 'rgba(245,200,60,.65)' },
  { key: 'PLATINE', label: 'Platine', emoji: '🏆', seuil: 100, from: '#8ee9ff', to: '#3fb6d8', glow: 'rgba(90,210,240,.6)' },
  { key: 'DIAMANT', label: 'Diamant', emoji: '💎', seuil: 250, from: '#a5f3fc', to: '#22d3ee', glow: 'rgba(34,211,238,.7)' },
  { key: 'LEGENDE', label: 'Légende', emoji: '👑', seuil: 500, from: '#f0abfc', to: '#a855f7', glow: 'rgba(168,85,247,.7)' },
];

export function tierMeta(t?: Tier | null): TierMeta {
  return TIERS.find(x => x.key === t) || TIERS[0];
}
