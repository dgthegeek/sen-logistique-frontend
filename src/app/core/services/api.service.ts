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
import { AdminVendeurActionResponse, AdminVendeursEnAttenteResponse, BloquerVendeurRequest, PageVendeur, SuspendreVendeurRequest, VendeurDetailDTO, VendeurFilters } from '../models/vendeur.model';
import {
  CommandeCloseur, CommandeDispatch, CommandeLivreur, MembreResponse, LivreurResponse,
  CreateMembreRequest, UpdateMembreRequest, AssignerLivreurRequest, AssignerLivreurResponse,
  LivrerRequest, EchecRequest, StatutLivraison, DashboardStats, BilanJour
} from '../models/closing-dispatch.model';
import {
  Produit, PageProduit, CreateProduitRequest, UpdateProduitRequest,
  MouvementStockRequest, AjustementStockRequest, Mouvement, CreateMonProduitRequest
} from '../models/stock.model';
import { BilanVendeur } from '../models/bilan-vendeur.model';
import { ClassementResponse } from '../models/classement.model';
import { PerformanceResponse } from '../models/performance.model';
import { TelegramStatut } from '../models/telegram.model';
import { LivreurSolde, VersementLivreur, PageVersement, LivreurFinances } from '../models/finance-livreur.model';
import { MaintenanceResult, VendeurImpact, SuppressionVendeurResult } from '../models/maintenance.model';

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

  /** Détail d'une commande partagé (closeur / dispatcheur / livreur / admin). */
  getCommandeDetail(id: number): Observable<LivraisonDetail> {
    return this.http.get<LivraisonDetail>(`${this.baseUrl}/commandes/${id}`);
  }

  getPerformance(periode: string = 'mois', debut?: string, fin?: string): Observable<PerformanceResponse> {
    let params = new HttpParams();
    if (debut && fin) {
      params = params.set('debut', debut).set('fin', fin);
    } else {
      params = params.set('periode', periode);
    }
    return this.http.get<PerformanceResponse>(`${this.baseUrl}/admin/performance`, { params });
  }

  // Finances
  getVendeurFinances(): Observable<VendeurFinances> {
    return this.http.get<VendeurFinances>(`${this.baseUrl}/vendeur/finances`);
  }

  demanderPaiement(demande: DemandePaiement): Observable<DemandePaiementResponse> {
    return this.http.post<DemandePaiementResponse>(`${this.baseUrl}/vendeur/demande-paiement`, null);
  }

  // ========== BILAN VENDEUR ==========

  private bilanParams(debut?: string, fin?: string): HttpParams {
    let params = new HttpParams();
    if (debut) { params = params.set('debut', debut); }
    if (fin) { params = params.set('fin', fin); }
    return params;
  }

  getVendeurBilan(debut?: string, fin?: string): Observable<BilanVendeur> {
    return this.http.get<BilanVendeur>(`${this.baseUrl}/vendeur/bilan`, { params: this.bilanParams(debut, fin) });
  }

  downloadVendeurBilanPdf(debut?: string, fin?: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/vendeur/bilan/pdf`, {
      params: this.bilanParams(debut, fin), responseType: 'blob'
    });
  }

  getAdminVendeurBilan(vendeurId: number, debut?: string, fin?: string): Observable<BilanVendeur> {
    return this.http.get<BilanVendeur>(`${this.baseUrl}/admin/vendeurs/${vendeurId}/bilan`, {
      params: this.bilanParams(debut, fin)
    });
  }

  downloadAdminVendeurBilanPdf(vendeurId: number, debut?: string, fin?: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/admin/vendeurs/${vendeurId}/bilan/pdf`, {
      params: this.bilanParams(debut, fin), responseType: 'blob'
    });
  }

  // ========== DIOKS LEAGUE (classement) ==========

  getClassement(): Observable<ClassementResponse> {
    return this.http.get<ClassementResponse>(`${this.baseUrl}/vendeur/classement`);
  }

  rejoindreClassement(): Observable<ClassementResponse> {
    return this.http.post<ClassementResponse>(`${this.baseUrl}/vendeur/classement/rejoindre`, {});
  }

  quitterClassement(): Observable<ClassementResponse> {
    return this.http.post<ClassementResponse>(`${this.baseUrl}/vendeur/classement/quitter`, {});
  }

  getAdminClassement(): Observable<ClassementResponse> {
    return this.http.get<ClassementResponse>(`${this.baseUrl}/admin/classement`);
  }

  // ========== NOTIFICATIONS TELEGRAM ==========

  // Endpoints Telegram génériques (tous les rôles peuvent lier leur compte)
  getTelegramStatut(): Observable<TelegramStatut> {
    return this.http.get<TelegramStatut>(`${this.baseUrl}/profil/telegram`);
  }

  delierTelegram(): Observable<TelegramStatut> {
    return this.http.post<TelegramStatut>(`${this.baseUrl}/profil/telegram/delier`, {});
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

  getLivraisonByNumero(numeroTracking: string): Observable<DeliveryInfo> {
  return this.http.get<DeliveryInfo>(`${this.baseUrl}/delivery/${numeroTracking}`);
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

  getVendeursEnAttente(): Observable<AdminVendeursEnAttenteResponse> {
    return this.http.get<AdminVendeursEnAttenteResponse>(`${this.baseUrl}/admin/vendeurs/en-attente`);
  }

  // Liste tous les vendeurs avec filtres et pagination
  getVendeurs(filters?: VendeurFilters, page: number = 0, size: number = 20): Observable<PageVendeur> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters?.statut) {
      params = params.set('statut', filters.statut);
    }

    if (filters?.quartier) {
      params = params.set('quartier', filters.quartier);
    }

    if (filters?.commune) {
      params = params.set('commune', filters.commune);
    }

    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    if (filters?.sort) {
      params = params.set('sort', filters.sort);
    }

    if (filters?.order) {
      params = params.set('order', filters.order);
    }

    return this.http.get<PageVendeur>(`${this.baseUrl}/admin/vendeurs`, { params });
  }

  // Détails d'un vendeur
  getVendeurDetail(id: number): Observable<VendeurDetailDTO> {
    return this.http.get<VendeurDetailDTO>(`${this.baseUrl}/admin/vendeurs/${id}`);
  }

  // Valider un vendeur (avec commission fixe = prix de livraison du vendeur)
  validerVendeur(id: number, commission?: number): Observable<AdminVendeurActionResponse> {
    const body = commission != null ? { commission } : {};
    return this.http.post<AdminVendeurActionResponse>(`${this.baseUrl}/admin/vendeurs/${id}/valider`, body);
  }

  // Régler / modifier la commission fixe d'un vendeur
  setCommissionVendeur(id: number, commission: number): Observable<VendeurDetailDTO> {
    return this.http.put<VendeurDetailDTO>(`${this.baseUrl}/admin/vendeurs/${id}/commission`, { commission });
  }

  // Suspendre un vendeur
  suspendreVendeur(id: number, data: SuspendreVendeurRequest): Observable<AdminVendeurActionResponse> {
    return this.http.post<AdminVendeurActionResponse>(`${this.baseUrl}/admin/vendeurs/${id}/suspendre`, data);
  }

  // Bloquer un vendeur
  bloquerVendeur(id: number, data: BloquerVendeurRequest): Observable<AdminVendeurActionResponse> {
    return this.http.post<AdminVendeurActionResponse>(`${this.baseUrl}/admin/vendeurs/${id}/bloquer`, data);
  }

  // Réactiver un vendeur
  reactiverVendeur(id: number): Observable<AdminVendeurActionResponse> {
    return this.http.post<AdminVendeurActionResponse>(`${this.baseUrl}/admin/vendeurs/${id}/reactiver`, {});
  }

  // ========== CLOSING (Closeur) ==========

  getCommandesCloseur(statut?: StatutLivraison): Observable<CommandeCloseur[]> {
    let params = new HttpParams();
    if (statut) { params = params.set('statut', statut); }
    return this.http.get<CommandeCloseur[]>(`${this.baseUrl}/closeur/commandes`, { params });
  }

  closeurAppeler(id: number): Observable<CommandeCloseur> {
    return this.http.post<CommandeCloseur>(`${this.baseUrl}/closeur/commandes/${id}/appeler`, {});
  }

  closeurConfirmer(id: number): Observable<CommandeCloseur> {
    return this.http.post<CommandeCloseur>(`${this.baseUrl}/closeur/commandes/${id}/confirmer`, {});
  }

  closeurPreteALivrer(id: number): Observable<CommandeCloseur> {
    return this.http.post<CommandeCloseur>(`${this.baseUrl}/closeur/commandes/${id}/prete-a-livrer`, {});
  }

  closeurReporter(id: number, commentaire?: string): Observable<CommandeCloseur> {
    return this.http.post<CommandeCloseur>(`${this.baseUrl}/closeur/commandes/${id}/reporter`, { commentaire });
  }

  closeurAnnuler(id: number, commentaire?: string): Observable<CommandeCloseur> {
    return this.http.post<CommandeCloseur>(`${this.baseUrl}/closeur/commandes/${id}/annuler`, { commentaire });
  }

  // ========== DISPATCH (dispatcheur / admin) ==========

  getDispatchPretes(): Observable<CommandeDispatch[]> {
    return this.http.get<CommandeDispatch[]>(`${this.baseUrl}/dispatch/pretes`);
  }

  /** Livreurs actifs pour l'assignation (accessible dispatcheur ET admin). */
  getDispatchLivreurs(): Observable<LivreurResponse[]> {
    return this.http.get<LivreurResponse[]>(`${this.baseUrl}/dispatch/livreurs`);
  }

  assignerLivreur(data: AssignerLivreurRequest): Observable<AssignerLivreurResponse> {
    return this.http.post<AssignerLivreurResponse>(`${this.baseUrl}/dispatch/assigner`, data);
  }

  // ========== EQUIPE (Admin) ==========

  getCloseurs(): Observable<MembreResponse[]> {
    return this.http.get<MembreResponse[]>(`${this.baseUrl}/admin/closeurs`);
  }

  createCloseur(data: CreateMembreRequest): Observable<MembreResponse> {
    return this.http.post<MembreResponse>(`${this.baseUrl}/admin/closeurs`, data);
  }

  updateCloseur(id: number, data: UpdateMembreRequest): Observable<MembreResponse> {
    return this.http.put<MembreResponse>(`${this.baseUrl}/admin/closeurs/${id}`, data);
  }

  getLivreurs(): Observable<LivreurResponse[]> {
    return this.http.get<LivreurResponse[]>(`${this.baseUrl}/admin/livreurs`);
  }

  createLivreur(data: CreateMembreRequest): Observable<LivreurResponse> {
    return this.http.post<LivreurResponse>(`${this.baseUrl}/admin/livreurs`, data);
  }

  updateLivreur(id: number, data: UpdateMembreRequest): Observable<LivreurResponse> {
    return this.http.put<LivreurResponse>(`${this.baseUrl}/admin/livreurs/${id}`, data);
  }

  getDispatcheurs(): Observable<MembreResponse[]> {
    return this.http.get<MembreResponse[]>(`${this.baseUrl}/admin/dispatcheurs`);
  }

  createDispatcheur(data: CreateMembreRequest): Observable<MembreResponse> {
    return this.http.post<MembreResponse>(`${this.baseUrl}/admin/dispatcheurs`, data);
  }

  updateDispatcheur(id: number, data: UpdateMembreRequest): Observable<MembreResponse> {
    return this.http.put<MembreResponse>(`${this.baseUrl}/admin/dispatcheurs/${id}`, data);
  }

  // ========== LIVREUR ==========

  getMesLivraisonsLivreur(statut?: StatutLivraison): Observable<CommandeLivreur[]> {
    let params = new HttpParams();
    if (statut) { params = params.set('statut', statut); }
    return this.http.get<CommandeLivreur[]>(`${this.baseUrl}/livreur/mes-livraisons`, { params });
  }

  livreurCommencer(id: number): Observable<CommandeLivreur> {
    return this.http.post<CommandeLivreur>(`${this.baseUrl}/livreur/livraisons/${id}/commencer`, {});
  }

  livreurLivrer(id: number, data: LivrerRequest): Observable<CommandeLivreur> {
    return this.http.post<CommandeLivreur>(`${this.baseUrl}/livreur/livraisons/${id}/livrer`, data);
  }

  livreurEchec(id: number, data: EchecRequest): Observable<CommandeLivreur> {
    return this.http.post<CommandeLivreur>(`${this.baseUrl}/livreur/livraisons/${id}/echec`, data);
  }

  // ========== STATS (Admin) ==========

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/admin/stats/dashboard`);
  }

  getBilan(date?: string): Observable<BilanJour> {
    let params = new HttpParams();
    if (date) { params = params.set('date', date); }
    return this.http.get<BilanJour>(`${this.baseUrl}/admin/bilan`, { params });
  }

  // ========== STOCK (Admin) ==========

  getProduits(search?: string, vendeurId?: number, page: number = 0, size: number = 50): Observable<PageProduit> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (search) { params = params.set('search', search); }
    if (vendeurId) { params = params.set('vendeurId', vendeurId.toString()); }
    return this.http.get<PageProduit>(`${this.baseUrl}/admin/produits`, { params });
  }

  getProduit(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.baseUrl}/admin/produits/${id}`);
  }

  createProduit(data: CreateProduitRequest): Observable<Produit> {
    return this.http.post<Produit>(`${this.baseUrl}/admin/produits`, data);
  }

  updateProduit(id: number, data: UpdateProduitRequest): Observable<Produit> {
    return this.http.put<Produit>(`${this.baseUrl}/admin/produits/${id}`, data);
  }

  entreeStock(id: number, data: MouvementStockRequest): Observable<Produit> {
    return this.http.post<Produit>(`${this.baseUrl}/admin/produits/${id}/entree-stock`, data);
  }

  ajusterStock(id: number, data: AjustementStockRequest): Observable<Produit> {
    return this.http.post<Produit>(`${this.baseUrl}/admin/produits/${id}/ajuster`, data);
  }

  getMouvements(id: number): Observable<Mouvement[]> {
    return this.http.get<Mouvement[]>(`${this.baseUrl}/admin/produits/${id}/mouvements`);
  }

  scanProduit(code: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.baseUrl}/admin/produits/scan/${code}`);
  }

  getStockAlertes(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.baseUrl}/admin/stock/alertes`);
  }

  // ========== STOCK (Vendeur) ==========

  getMesProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.baseUrl}/vendeur/produits`);
  }

  creerMonProduit(data: CreateMonProduitRequest): Observable<Produit> {
    return this.http.post<Produit>(`${this.baseUrl}/vendeur/produits`, data);
  }

  modifierMonProduit(id: number, data: UpdateProduitRequest): Observable<Produit> {
    return this.http.put<Produit>(`${this.baseUrl}/vendeur/produits/${id}`, data);
  }

  // ========== COORDINATEUR LOGISTIQUE (ex-Dispatcheur) ==========

  /** Historique des commandes (filtrable statut/date), pour le coordinateur. */
  getCoordinateurHistorique(statut?: string, date?: string, page: number = 0, size: number = 50): Observable<LivraisonsAdminResponse> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (statut) { params = params.set('statut', statut); }
    if (date) { params = params.set('date', date); }
    return this.http.get<LivraisonsAdminResponse>(`${this.baseUrl}/dispatch/commandes`, { params });
  }

  /** Créer une commande (coordinateur) pour le compte d'un vendeur. */
  coordinateurCreerCommande(data: CreateLivraisonRequest): Observable<CreateLivraisonResponse> {
    return this.http.post<CreateLivraisonResponse>(`${this.baseUrl}/dispatch/commandes`, data);
  }

  /** Soldes de cash à régler par livreur (coordinateur). */
  getCoordinateurSoldesLivreurs(): Observable<LivreurSolde[]> {
    return this.http.get<LivreurSolde[]>(`${this.baseUrl}/dispatch/finances/livreurs`);
  }

  /** Marquer le cash d'un livreur comme versé (coordinateur). */
  coordinateurVerserLivreur(livreurId: number, commentaire?: string): Observable<VersementLivreur> {
    return this.http.post<VersementLivreur>(`${this.baseUrl}/dispatch/finances/livreurs/${livreurId}/verser`, { commentaire });
  }

  /** Historique des versements (coordinateur). */
  getCoordinateurVersements(page: number = 0, size: number = 50): Observable<PageVersement> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<PageVersement>(`${this.baseUrl}/dispatch/finances/versements`, { params });
  }

  // ========== FINANCE LIVREURS (Admin) ==========

  getAdminSoldesLivreurs(): Observable<LivreurSolde[]> {
    return this.http.get<LivreurSolde[]>(`${this.baseUrl}/admin/finances/livreurs`);
  }

  adminVerserLivreur(livreurId: number, commentaire?: string): Observable<VersementLivreur> {
    return this.http.post<VersementLivreur>(`${this.baseUrl}/admin/finances/livreurs/${livreurId}/verser`, { commentaire });
  }

  getAdminVersements(page: number = 0, size: number = 50): Observable<PageVersement> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<PageVersement>(`${this.baseUrl}/admin/finances/versements`, { params });
  }

  // ========== LIVREUR : historique & finances ==========

  getLivreurHistorique(statut?: StatutLivraison): Observable<CommandeLivreur[]> {
    let params = new HttpParams();
    if (statut) { params = params.set('statut', statut); }
    return this.http.get<CommandeLivreur[]>(`${this.baseUrl}/livreur/historique`, { params });
  }

  getLivreurFinances(): Observable<LivreurFinances> {
    return this.http.get<LivreurFinances>(`${this.baseUrl}/livreur/finances`);
  }

  // ========== CLOSEUR : historique ==========

  getCloseurHistorique(): Observable<CommandeCloseur[]> {
    return this.http.get<CommandeCloseur[]>(`${this.baseUrl}/closeur/historique`);
  }

  // ========== MAINTENANCE (Admin) — suppression de données ==========

  maintenanceSupprimerLivraison(id: number): Observable<MaintenanceResult> {
    return this.http.delete<MaintenanceResult>(`${this.baseUrl}/admin/maintenance/livraisons/${id}`);
  }

  maintenanceSupprimerTransaction(id: number): Observable<MaintenanceResult> {
    return this.http.delete<MaintenanceResult>(`${this.baseUrl}/admin/maintenance/transactions/${id}`);
  }

  maintenanceSupprimerMembre(userId: number): Observable<MaintenanceResult> {
    return this.http.delete<MaintenanceResult>(`${this.baseUrl}/admin/maintenance/membres/${userId}`);
  }

  maintenanceImpactVendeur(id: number): Observable<VendeurImpact> {
    return this.http.get<VendeurImpact>(`${this.baseUrl}/admin/maintenance/vendeurs/${id}/impact`);
  }

  maintenanceSupprimerVendeur(id: number): Observable<SuppressionVendeurResult> {
    return this.http.delete<SuppressionVendeurResult>(`${this.baseUrl}/admin/maintenance/vendeurs/${id}`);
  }

}