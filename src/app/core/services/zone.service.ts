import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PageZone,
  ZoneDetailDTO,
  CreateZoneRequest,
  UpdateZoneRequest,
  UpdateTarifsRequest,
  ZoneResponse,
  TarifsResponse,
  ToggleResponse
} from '../models/zone.model';


import {
  CreateQuartierRequest, UpdateQuartierRequest, CreateQuartierResponse,
  UpdateQuartierResponse, DeleteQuartierResponse, ToggleQuartierResponse
} from '../models/zone.model';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private apiUrl = `${environment.apiUrl}/admin/zones`;
  private quartierUrl = `${environment.apiUrl}`;


  constructor(private http: HttpClient) { }

  /**
   * Liste paginée des zones avec filtres
   */
  getZones(actif?: boolean, search?: string, page: number = 0, size: number = 20): Observable<PageZone> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (actif !== undefined) {
      params = params.set('actif', actif.toString());
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PageZone>(this.apiUrl, { params });
  }

  /**
   * Détails d'une zone avec quartiers
   */
  getZoneDetail(id: number): Observable<ZoneDetailDTO> {
    return this.http.get<ZoneDetailDTO>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer une nouvelle zone
   */
  createZone(request: CreateZoneRequest): Observable<ZoneResponse> {
    return this.http.post<ZoneResponse>(this.apiUrl, request);
  }

  /**
   * Modifier une zone (tous les champs)
   */
  updateZone(id: number, request: UpdateZoneRequest): Observable<ZoneResponse> {
    return this.http.put<ZoneResponse>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Modifier uniquement les tarifs
   */
  updateTarifs(id: number, request: UpdateTarifsRequest): Observable<TarifsResponse> {
    return this.http.patch<TarifsResponse>(`${this.apiUrl}/${id}/tarifs`, request);
  }

  /**
   * Activer/Désactiver une zone
   */
  toggleZone(id: number): Observable<ToggleResponse> {
    return this.http.patch<ToggleResponse>(`${this.apiUrl}/${id}/toggle`, {});
  }

  /**
   * Supprimer une zone
   */
  deleteZone(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }


  // Créer quartier
  createQuartier(request: CreateQuartierRequest): Observable<CreateQuartierResponse> {
    return this.http.post<CreateQuartierResponse>(`${this.quartierUrl}/admin/quartiers`, request);
  }

  // Modifier quartier
  updateQuartier(id: number, request: UpdateQuartierRequest): Observable<UpdateQuartierResponse> {
    return this.http.put<UpdateQuartierResponse>(`${this.quartierUrl}/admin/quartiers/${id}`, request);
  }

  // Supprimer quartier
  deleteQuartier(id: number): Observable<DeleteQuartierResponse> {
    return this.http.delete<DeleteQuartierResponse>(`${this.quartierUrl}/admin/quartiers/${id}`);
  }

  // Toggle quartier
  toggleQuartier(id: number): Observable<ToggleQuartierResponse> {
    return this.http.patch<ToggleQuartierResponse>(`${this.quartierUrl}/admin/quartiers/${id}/toggle`, {});
  }
}