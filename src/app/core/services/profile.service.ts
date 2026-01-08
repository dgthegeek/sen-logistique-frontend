// src/app/core/services/profil.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ProfilResponse,
  UpdateProfilRequest,
  ChangePasswordRequest,
  ProfilUpdateResponse,
  PasswordChangeResponse
} from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfilService {
  private apiUrl = `${environment.apiUrl}/profil`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer mon profil
   */
  getProfil(): Observable<ProfilResponse> {
    return this.http.get<ProfilResponse>(this.apiUrl);
  }

  /**
   * Modifier mon profil
   */
  updateProfil(request: UpdateProfilRequest): Observable<ProfilUpdateResponse> {
    return this.http.put<ProfilUpdateResponse>(this.apiUrl, request);
  }

  /**
   * Changer mon mot de passe
   */
  changePassword(request: ChangePasswordRequest): Observable<PasswordChangeResponse> {
    return this.http.patch<PasswordChangeResponse>(`${this.apiUrl}/password`, request);
  }
}