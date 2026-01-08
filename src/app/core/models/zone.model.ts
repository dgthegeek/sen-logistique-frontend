export interface ZoneAdminDTO {
  id: number;
  nom: string;
  description: string;
  tarifStandard: number;
  tarifExpress: number;
  actif: boolean;
  nombreQuartiers: number;
  dateCreation: string;
  dateModification: string;
}

export interface ZoneDetailDTO {
  id: number;
  nom: string;
  description: string;
  tarifStandard: number;
  tarifExpress: number;
  actif: boolean;
  quartiers: QuartierSimple[];
  dateCreation: string;
  dateModification: string;
}

export interface QuartierSimple {
  id: number;
  nom: string;
  commune: string;
  actif: boolean;
}

export interface CreateZoneRequest {
  nom: string;
  description?: string;
  tarifStandard: number;
  tarifExpress: number;
  actif: boolean;
}

export interface UpdateZoneRequest {
  nom: string;
  description?: string;
  tarifStandard: number;
  tarifExpress: number;
  actif: boolean;
}

export interface UpdateTarifsRequest {
  tarifStandard: number;
  tarifExpress: number;
}

export interface PageZone {
  content: ZoneAdminDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ZoneResponse {
  message: string;
  zone: ZoneAdminDTO;
}

export interface TarifsResponse {
  message: string;
  zone: {
    id: number;
    nom: string;
    tarifStandard: number;
    tarifExpress: number;
  };
}

export interface ToggleResponse {
  message: string;
  zone: {
    id: number;
    nom: string;
    actif: boolean;
  };
}

// ========== QUARTIER MODELS ==========

export interface CreateQuartierRequest {
  nom: string;
  commune: string;
  zoneId: number;
  actif?: boolean;
}

export interface UpdateQuartierRequest {
  nom: string;
  commune: string;
  zoneId: number;
  actif?: boolean;
}

export interface QuartierDTO {
  id: number;
  nom: string;
  commune: string;
  actif: boolean;
  zone: {
    id: number;
    nom: string;
  };
}

export interface CreateQuartierResponse {
  message: string;
  quartier: QuartierDTO;
}

export interface UpdateQuartierResponse {
  message: string;
  quartier: QuartierDTO;
}

export interface DeleteQuartierResponse {
  message: string;
}

export interface ToggleQuartierResponse {
  message: string;
  quartier: {
    id: number;
    nom: string;
    actif: boolean;
  };
}
