import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quartier } from '../models/auth.model';
import { environment } from '../../../environments/environment';

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

  getMesLivraisons(params?: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/vendeur/livraisons`, { params });
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
  
}