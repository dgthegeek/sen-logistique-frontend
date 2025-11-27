import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Zones
  getZones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/zones`);
  }

  // Vendeur
  getVendeurDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/vendeur/dashboard`);
  }

  // Admin
  getRamassagesToday(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/ramassages/today`);
  }

}