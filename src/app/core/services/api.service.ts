import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quartier } from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { CalculTarifRequest, CalculTarifResponse } from '../models/livraison.model';
import { Livraison, LivraisonsResponse, LivraisonFilters } from '../models/livraison.model';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Quartiers
  getQuartiersByCommune(commune: string): Observable<Quartier[]> {
    return this.http.get<Quartier[]>(`${this.baseUrl}/quartiers/commune/${commune}`);
  }

  // Zones
  getZones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/zones`);
  }

  // Vendeur
  getVendeurDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/vendeur/dashboard`);
  }



  creerLivraison(request: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/vendeur/livraisons`, request);
  }

  // Admin
  getRamassagesToday(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/ramassages/today`);
  }

  marquerRamasse(livraisonIds: number[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/ramassages/marquer-ramasse`, { livraisonIds });
  }

  calculerTarif(data: CalculTarifRequest): Observable<CalculTarifResponse> {
  return this.http.post<CalculTarifResponse>(`${this.baseUrl}/tarifs/calculer`, data);
}

// Ajouter dans la classe :

getMesLivraisons(page: number = 0, size: number = 10, filters?: LivraisonFilters): Observable<LivraisonsResponse> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());
  
  if (filters?.statut) {
    params = params.set('statut', filters.statut);
  }
  
  if (filters?.dateDebut) {
    params = params.set('dateDebut', filters.dateDebut);
  }
  
  if (filters?.dateFin) {
    params = params.set('dateFin', filters.dateFin);
  }
  
  if (filters?.search) {
    params = params.set('search', filters.search);
  }
  
  return this.http.get<LivraisonsResponse>(`${this.baseUrl}/vendeur/livraisons`, { params });
}

getLivraisonById(id: number): Observable<Livraison> {
  return this.http.get<Livraison>(`${this.baseUrl}/vendeur/livraisons/${id}`);
}
  
  
}