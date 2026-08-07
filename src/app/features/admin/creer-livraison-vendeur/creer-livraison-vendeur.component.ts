import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ZoneService } from '../../../core/services/zone.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { StatutVendeur, VendeurDTO, VendeurFilters } from '../../../core/models/vendeur.model';
import { CreateLivraisonRequest, CalculTarifRequest, Zone } from '../../../core/models/livraison.model';
import { MarquerRamasseRequest } from '../../../core/models/admin.model';
import { Produit } from '../../../core/models/stock.model';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-creer-livraison-vendeur',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FcfaPipe, HeaderComponent, SidebarComponent],
  templateUrl: './creer-livraison-vendeur.component.html',
  styleUrls: ['./creer-livraison-vendeur.component.css']
})
export class CreerLivraisonVendeurComponent implements OnInit {
  livraisonForm!: FormGroup;
  currentStep = 0; // 0 = sélection vendeur, 1-3 = comme vendeur
  
  // Vendeurs
  vendeurs: VendeurDTO[] = [];
  selectedVendeur: VendeurDTO | null = null;
  loadingVendeurs = false;
  searchVendeurTerm = '';
  hasSearched = false;
  private searchSubject = new Subject<string>();
  
  // Zones et tarifs
  communes: string[] = [];
  ZoneId: any = null
  
  filteredQuartiers: any[] = [];
  tarifPreview: any = null;
  tarif: any = null;
  calculatingPreview = false;
  calculatingTarif = false;
  
  // Loading & errors
  loading = false;
  errorMessage = '';
  
  // Success
  createdLivraison: any = null;
  autoRamassageInProgress = false;

  // Produits (stock) - sélection optionnelle pour décrément auto
  produits: Produit[] = [];

  // Panier multi-produits (optionnel)
  panier: { produitId: number; nom: string; prix: number; quantite: number }[] = [];
  selProduitId: number | null = null;
  selQuantite = 1;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private zoneService: ZoneService,
    private toastService: ToastService,
    private router: Router,
    private authService: AuthService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.setupSearchDebounce();
    this.loadProduits();
  }

  loadProduits() {
    this.apiService.getProduits(undefined, undefined, 0, 200).subscribe({
      next: (p) => this.produits = p.content.filter(pr => pr.actif),
      error: () => {}
    });
  }

  /** Produits actifs du partenaire sélectionné. */
  get produitsDuVendeur(): Produit[] {
    if (!this.selectedVendeur) { return []; }
    return this.produits.filter(p => p.vendeurId === this.selectedVendeur!.id);
  }

  /** Total des produits du panier (prix x quantité). */
  get produitsTotal(): number {
    return this.panier.reduce((t, l) => t + (l.prix * l.quantite), 0);
  }

  ajouterAuPanier(): void {
    const produit = this.produits.find(p => p.id === this.selProduitId);
    if (!produit) { return; }
    const qte = this.selQuantite && this.selQuantite > 0 ? this.selQuantite : 1;
    const existant = this.panier.find(l => l.produitId === produit.id);
    if (existant) {
      existant.quantite += qte;
    } else {
      this.panier.push({
        produitId: produit.id, nom: produit.nom,
        prix: produit.prixUnitaire || 0, quantite: qte
      });
    }
    this.selProduitId = null;
    this.selQuantite = 1;
    this.syncPanier();
  }

  retirerDuPanier(index: number): void {
    this.panier.splice(index, 1);
    this.syncPanier();
  }

  /** Recalcule le montant produit + la description à partir du panier. */
  private syncPanier(): void {
    // Le prix de la commande est toujours le total des produits sélectionnés.
    this.livraisonForm.patchValue({
      montantProduit: this.produitsTotal,
      descriptionProduit: this.panier.length > 0
        ? this.panier.map(l => `${l.quantite}x ${l.nom}`).join(', ')
        : ''
    });
  }

  initForm() {
    this.livraisonForm = this.fb.group({
      // Infos client
      nomClient: ['', [Validators.required, Validators.minLength(2)]],
      telephoneClient: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{9,}$/)]],
      adresseComplete: ['', Validators.required],
      pointRepere: [''],
      // Infos colis
      descriptionProduit: ['', Validators.required],
      fragile: [false],
      poidsEstime: [null],
      montantProduit: [0, [Validators.required, Validators.min(1)]],
      urgence: ['NORMAL', Validators.required],
      creneauSouhaite: [''],
      notesLivreur: ['']
    });
  }

  setupSearchDebounce() {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchVendeurs(searchTerm);
    });
  }

  onSearchVendeur() {
    const term = this.searchVendeurTerm.trim();
    
    // Ne rechercher que si au moins 2 caractères
    if (term.length < 2) {
      this.vendeurs = [];
      this.hasSearched = false;
      return;
    }
    
    this.searchSubject.next(term);
  }

  searchVendeurs(searchTerm: string) {
    this.loadingVendeurs = true;
    this.hasSearched = true;
    
    const filters: VendeurFilters = {
      statut: StatutVendeur.ACTIF,
      commune: '',
      quartier: '',
      search: searchTerm,
      sort: 'dateInscription',
      order: 'desc'
    };

    this.apiService.getVendeurs(filters, 0, 20).subscribe({
      next: (data) => {
        this.vendeurs = data.content;
        this.loadingVendeurs = false;
      },
      error: () => {
        this.toastService.error('Erreur lors de la recherche des vendeurs');
        this.loadingVendeurs = false;
        this.vendeurs = [];
      }
    });
  }

  selectVendeur(vendeur: VendeurDTO) {
    this.selectedVendeur = vendeur;
    this.currentStep = 1;
  }

  loadCommunes() {
    this.zoneService.getZones(true, '', 0, 100).subscribe({
      next: (data) => {
        const allQuartiers: any[] = [];
        data.content.forEach(zone => {
          this.zoneService.getZoneDetail(zone.id).subscribe({
            next: (detail) => {
              detail.quartiers.forEach(q => {
                if (!allQuartiers.find(qt => qt.nom === q.nom && qt.commune === q.commune)) {
                  allQuartiers.push(q);
                }
              });
              this.communes = [...new Set(allQuartiers.map(q => q.commune))].sort();
            }
          });
        });
      }
    });
  }

  setupFormListeners() {
    // Adresses en saisie libre : plus aucune dépendance zone/quartier/commune.
  }

  // Commission fixe du vendeur sélectionné = prix de livraison (ajouté au COD)
  get commissionFixe(): number {
    return this.selectedVendeur?.commissionFixe || 0;
  }

  get montantCODTotal(): number {
    const montantProduit = this.livraisonForm.get('montantProduit')?.value || 0;
    return montantProduit + this.commissionFixe;
  }

  nextStep() {
    // Validation étape 1
    if (this.currentStep === 1) {
      const step1Controls = ['nomClient', 'telephoneClient', 'adresseComplete'];
      const step1Valid = step1Controls.every(control => this.livraisonForm.get(control)?.valid);
      
      if (!step1Valid) {
        step1Controls.forEach(control => this.livraisonForm.get(control)?.markAsTouched());
        this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
        return;
      }
    }

    // Validation étape 2 (le tarif = commission fixe, aucun calcul de zone requis)
    if (this.currentStep === 2) {
      if (this.panier.length === 0) {
        this.errorMessage = 'Ajoutez au moins un produit à la commande. Le prix est calculé automatiquement.';
        return;
      }

      const step2Controls = ['descriptionProduit', 'montantProduit'];
      const step2Valid = step2Controls.every(control => this.livraisonForm.get(control)?.valid);

      if (!step2Valid) {
        step2Controls.forEach(control => this.livraisonForm.get(control)?.markAsTouched());
        this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
        return;
      }
    }

    this.currentStep++;
    this.errorMessage = '';
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.errorMessage = '';
    }
  }

  onSubmit() {
    if (this.livraisonForm.invalid || !this.selectedVendeur) {
      this.errorMessage = 'Veuillez remplir correctement le formulaire';
      return;
    }

    const formValue = this.livraisonForm.value;
    const montantCOD = this.montantCODTotal;

    const request: CreateLivraisonRequest = {
      telephoneVendeur: this.selectedVendeur.telephone,
      nomClient: formValue.nomClient,
      telephoneClient: formValue.telephoneClient,
      adresseComplete: formValue.adresseComplete,
      pointRepere: formValue.pointRepere || undefined,
      descriptionProduit: formValue.descriptionProduit,
      items: this.panier.length > 0
        ? this.panier.map(l => ({ produitId: l.produitId, quantite: l.quantite }))
        : undefined,
      fragile: formValue.fragile,
      poids: formValue.poidsEstime || undefined,
      montantCOD: montantCOD,
      urgence: formValue.urgence,
      creneauSouhaite: formValue.creneauSouhaite || undefined,
      notesPourLivreur: formValue.notesLivreur || undefined
    };

    this.loading = true;

    // Créer la livraison. Le coordinateur logistique (dispatcheur) passe par
    // /dispatch/commandes ; l'admin par /vendeur/livraisons. Même service back,
    // donc même comportement (produits, stock, file closeur).
    const creation$ = this.authService.isDispatcheur()
      ? this.apiService.coordinateurCreerCommande(request)
      : this.apiService.creerLivraison(request);
    creation$.subscribe({
      next: (response) => {
        this.createdLivraison = {
          ...response,
          montantARecevoir: formValue.montantProduit
        };

        // Nouveau flux Closing : la commande entre en file closeur (statut NOUVELLE).
        this.toastService.success('Commande créée ! Elle est dans la file du closeur (à appeler).');
        this.loading = false;
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Erreur lors de la création');
        this.loading = false;
      }
    });
  }

  autoRamassageLivraison(id: number) {
    const request: MarquerRamasseRequest = {
      livraisonIds: [id]
    };

    this.autoRamassageInProgress = true;
    
    // Utiliser marquerRamasse
    this.apiService.marquerRamasse(request).subscribe({
      next: () => {
        this.toastService.success('Livraison créée et ramassée automatiquement !');
        this.loading = false;
        this.autoRamassageInProgress = false;
      },
      error: () => {
        this.toastService.warning('Livraison créée mais le ramassage automatique a échoué. Veuillez ramasser manuellement.');
        this.loading = false;
        this.autoRamassageInProgress = false;
      }
    });
  }

  closeSuccessModal() {
    this.router.navigate([this.authService.isDispatcheur() ? '/dispatcheur/historique' : '/admin/livraisons']);
  }

  resetForm() {
    this.currentStep = 0;
    this.selectedVendeur = null;
    this.createdLivraison = null;
    this.searchVendeurTerm = '';
    this.vendeurs = [];
    this.hasSearched = false;
    this.panier = [];
    this.selProduitId = null;
    this.selQuantite = 1;
    this.livraisonForm.reset({
      urgence: 'NORMAL',
      fragile: false,
      montantProduit: 0
    });
  }
}