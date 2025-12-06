import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VendeurDashboard } from '../models/dashboard.model';
import { Zone, Quartier, CalculTarifRequest, CalculTarifResponse, CreateLivraisonRequest, CreateLivraisonResponse, LivraisonResume, LivraisonDetail, LivraisonsResponse, LivraisonFilters } from '../models/livraison.model';
import { VendeurFinances, DemandePaiement, DemandePaiementResponse } from '../models/finance.model';
import {
  AdminFinances, AdminFinancesDashboard, ConfirmerLivraisonRequest, ConfirmerLivraisonResponse,
  LivraisonAdmin, LivraisonsAdminResponse, LivraisonsALivrer, MarquerRamasseRequest, PaiementsPending,
  PayerVendeurRequest, PayerVendeurResponse, RamassagesToday, RamassagesTodayResponse, TraiterPaiementRequest,
  TraiterPaiementResponse, TransactionsResponse
} from '../models/admin.model';
import { TrackingInfo } from '../models/tracking.model';
import { ConfirmLivraisonRequest, ConfirmLivraisonResponse, DeliveryInfo } from '../models/delivery.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Dashboard
  getVendeurDashboard(): Observable<VendeurDashboard> {
    return this.http.get<VendeurDashboard>(`${this.baseUrl}/vendeur/dashboard`);
  }

  // Zones
  getZones(): Observable<Zone[]> {
    return this.http.get<Zone[]>(`${this.baseUrl}/zones`);
  }

  getQuartiersByCommune(commune: string): Observable<Quartier[]> {
    return this.http.get<Quartier[]>(`${this.baseUrl}/quartiers/commune/${commune}`);
  }

  // Tarifs
  calculerTarif(data: CalculTarifRequest): Observable<CalculTarifResponse> {
    return this.http.post<CalculTarifResponse>(`${this.baseUrl}/tarifs/calculer`, data);
  }

  // Livraisons
  creerLivraison(data: CreateLivraisonRequest): Observable<CreateLivraisonResponse> {
    return this.http.post<CreateLivraisonResponse>(`${this.baseUrl}/vendeur/livraisons`, data);
  }

  getMesLivraisons(page: number = 0, size: number = 20, filters?: LivraisonFilters): Observable<LivraisonsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters?.statut) {
      params = params.set('statut', filters.statut);
    }

    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<LivraisonsResponse>(`${this.baseUrl}/vendeur/livraisons`, { params });
  }

  getLivraisonById(id: number): Observable<LivraisonDetail> {
    return this.http.get<LivraisonDetail>(`${this.baseUrl}/vendeur/livraisons/${id}`);
  }

  // Finances
  getVendeurFinances(): Observable<VendeurFinances> {
    return this.http.get<VendeurFinances>(`${this.baseUrl}/vendeur/finances`);
  }

  demanderPaiement(demande: DemandePaiement): Observable<DemandePaiementResponse> {
    return this.http.post<DemandePaiementResponse>(`${this.baseUrl}/vendeur/demande-paiement`, null);
  }

  // ========== ADMIN ==========

  // ========== DASHBOARD ADMIN (4 endpoints) ==========

  getAdminFinancesDashboard(periode: string = 'jour'): Observable<AdminFinancesDashboard> {
    return this.http.get<AdminFinancesDashboard>(`${this.baseUrl}/admin/finances/dashboard`, {
      params: { periode }
    });
  }

  getRamassagesTodayDashboard(): Observable<RamassagesToday> {
    return this.http.get<RamassagesToday>(`${this.baseUrl}/admin/ramassages/today`);
  }

  getLivraisonsALivrer(): Observable<LivraisonsALivrer> {
    return this.http.get<LivraisonsALivrer>(`${this.baseUrl}/admin/livraisons/a-livrer`);
  }

  getPaiementsPending(): Observable<PaiementsPending> {
    return this.http.get<PaiementsPending>(`${this.baseUrl}/admin/finances/paiements-pending`);
  }

  // Ramassages
  getRamassagesToday(): Observable<RamassagesTodayResponse> {
    return this.http.get<RamassagesTodayResponse>(`${this.baseUrl}/admin/ramassages/today`);
  }

  marquerRamasse(data: MarquerRamasseRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/admin/ramassages/marquer-ramasse`, data);
  }


  getRamassagesARamasser(): Observable<RamassagesToday> {
    return this.http.get<RamassagesToday>(`${this.baseUrl}/admin/ramassages`);
  }



  imprimerQRCodes(livraisonIds: number[]): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/admin/ramassages/imprimer-qr`,
      { livraisonIds },
      { responseType: 'blob' }
    );
  }

  // Livraisons Admin
  getLivraisonsAdmin(page: number = 0, size: number = 20, statut?: string): Observable<LivraisonsAdminResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (statut) {
      params = params.set('statut', statut);
    }

    return this.http.get<LivraisonsAdminResponse>(`${this.baseUrl}/admin/livraisons`, { params });
  }

  getLivraisonAdminById(id: number): Observable<LivraisonAdmin> {
    return this.http.get<LivraisonAdmin>(`${this.baseUrl}/admin/livraisons/${id}`);
  }

  getLivraisonByNumero(numero: string): Observable<LivraisonAdmin> {
    return this.http.get<LivraisonAdmin>(`${this.baseUrl}/delivery/${numero}`);
  }

  confirmerLivraison(numero: string, data: ConfirmerLivraisonRequest): Observable<ConfirmerLivraisonResponse> {
    return this.http.post<ConfirmerLivraisonResponse>(`${this.baseUrl}/delivery/${numero}/livrer`, data);
  }

  // Finances Admin
  getAdminFinances(): Observable<AdminFinances> {
    return this.http.get<AdminFinances>(`${this.baseUrl}/admin/finances/dashboard`);
  }

  traiterPaiement(data: TraiterPaiementRequest): Observable<TraiterPaiementResponse> {
    return this.http.post<TraiterPaiementResponse>(`${this.baseUrl}/admin/paiements/traiter`, data);
  }

  // ========== FINANCES ADMIN ==========


  // Payer un vendeur
  payerVendeur(vendeurId: number, data: PayerVendeurRequest): Observable<PayerVendeurResponse> {
    return this.http.post<PayerVendeurResponse>(`${this.baseUrl}/admin/finances/payer-vendeur/${vendeurId}`, data);
  }

  // Historique transactions
  getTransactionsAdmin(vendeurId?: number, dateDebut?: string, dateFin?: string, page: number = 0, size: number = 50): Observable<TransactionsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (vendeurId) {
      params = params.set('vendeurId', vendeurId.toString());
    }

    if (dateDebut) {
      params = params.set('dateDebut', dateDebut);
    }

    if (dateFin) {
      params = params.set('dateFin', dateFin);
    }

    return this.http.get<TransactionsResponse>(`${this.baseUrl}/admin/finances/transactions`, { params });
  }

  // Tracking public (sans authentification)
  getTrackingInfo(numeroTracking: string): Observable<TrackingInfo> {
    return this.http.get<TrackingInfo>(`${this.baseUrl}/tracking/${numeroTracking}`);
  }

  // Récupérer infos livraison (après scan QR)
  getDeliveryInfo(numeroTracking: string): Observable<DeliveryInfo> {
    return this.http.get<DeliveryInfo>(`${this.baseUrl}/delivery/${numeroTracking}`);
  }

  // Confirmer livraison
  confirmerLivraisonPublic(numeroTracking: string, data: ConfirmLivraisonRequest): Observable<ConfirmLivraisonResponse> {
    return this.http.post<ConfirmLivraisonResponse>(`${this.baseUrl}/delivery/${numeroTracking}/livrer`, data);
  }
}