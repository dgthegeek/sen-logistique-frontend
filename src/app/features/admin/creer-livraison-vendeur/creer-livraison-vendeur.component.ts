import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ZoneService } from '../../../core/services/zone.service';
import { ToastService } from '../../../core/services/toast.service';
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

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private zoneService: ZoneService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadCommunes();
    this.setupFormListeners();
    this.setupSearchDebounce();
    this.loadProduits();
  }

  loadProduits() {
    this.apiService.getProduits(undefined, 0, 200).subscribe({
      next: (p) => this.produits = p.content.filter(pr => pr.actif),
      error: () => {}
    });
  }

  /** Produits actifs du partenaire sélectionné. */
  get produitsDuVendeur(): Produit[] {
    if (!this.selectedVendeur) { return []; }
    return this.produits.filter(p => p.vendeurId === this.selectedVendeur!.id);
  }

  initForm() {
    this.livraisonForm = this.fb.group({
      // Infos client
      nomClient: ['', [Validators.required, Validators.minLength(2)]],
      telephoneClient: ['', [Validators.required, Validators.pattern(/^(77|78|76|70|75)[0-9]{7}$/)]],
      commune: ['', Validators.required],
      quartier: ['', Validators.required],
      adresseComplete: ['', Validators.required],
      pointRepere: [''],
      // Infos colis
      descriptionProduit: ['', Validators.required],
      produitId: [null],
      quantite: [1],
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
    // Listener changement commune
    this.livraisonForm.get('commune')?.valueChanges.subscribe(commune => {
      this.filteredQuartiers = [];
      this.livraisonForm.patchValue({ quartier: '' });
      
      if (commune) {
        this.zoneService.getZones(true, '', 0, 100).subscribe({
          next: (data) => {
            data.content.forEach(zone => {
              this.zoneService.getZoneDetail(zone.id).subscribe({
                next: (detail) => {
                  const quartiers = detail.quartiers.filter(q => q.commune === commune && q.actif);
                  this.filteredQuartiers = [...this.filteredQuartiers, ...quartiers]
                    .filter((q, i, arr) => arr.findIndex(qt => qt.nom === q.nom) === i);
                }
              });
            });
          }
        });
      }
    });

    // Listener changement quartier
    this.livraisonForm.get('quartier')?.valueChanges.subscribe(() => {
      setTimeout(() => this.calculatePreviewTarif(), 100);
    });

    // Listener changement urgence
    this.livraisonForm.get('urgence')?.valueChanges.subscribe(() => {
      this.calculatePreviewTarif();
    });
  }

  calculatePreviewTarif() {
    const quartier = this.livraisonForm.get('quartier')?.value;
    const commune = this.livraisonForm.get('commune')?.value;
    const urgence = this.livraisonForm.get('urgence')?.value;

    if (!quartier || !commune) {
      this.tarifPreview = null;
      return;
    }

    this.calculatingPreview = true;
    
    // Trouver le zoneId pour la commune destination
    this.zoneService.getZones(true, '', 0, 100).subscribe({
      next: (data) => {
        let zoneId: number | null = null;
        let zonesChecked = 0;
        
        data.content.forEach(zone => {
          this.zoneService.getZoneDetail(zone.id).subscribe({
            next: (detail) => {
              zonesChecked++;
              const hasCommune = detail.quartiers.some(q => q.commune === commune);
              
              if (hasCommune && !zoneId) {
                zoneId = zone.id;
                
                // Appel API avec tous les champs requis
                const request: CalculTarifRequest = {
                  zoneId: zoneId,
                  communeDepart: 'Dakar',          // Warehouse admin
                  quartierDepart: 'Plateau',       // Warehouse admin
                  communeDestination: commune,
                  quartierDestination: quartier,
                  montantCOD: 0,                   // Juste pour calculer frais
                  urgence: urgence
                };

                this.apiService.calculerTarif(request).subscribe({
                  next: (tarif) => {
                    this.tarifPreview = tarif;
                    this.calculatingPreview = false;
                  },
                  error: () => {
                    this.tarifPreview = null;
                    this.calculatingPreview = false;
                  }
                });
              } else if (zonesChecked === data.content.length && !zoneId) {
                // Toutes les zones vérifiées, aucune trouvée
                this.tarifPreview = null;
                this.calculatingPreview = false;
              }
            }
          });
        });
      },
      error: () => {
        this.tarifPreview = null;
        this.calculatingPreview = false;
      }
    });
  }

  get montantCODTotal(): number {
    const montantProduit = this.livraisonForm.get('montantProduit')?.value || 0;
    const fraisLivraison = this.tarifPreview?.montant || 0;
    return montantProduit + fraisLivraison;
  }

  nextStep() {
    // Validation étape 1
    if (this.currentStep === 1) {
      const step1Controls = ['nomClient', 'telephoneClient', 'commune', 'quartier', 'adresseComplete'];
      const step1Valid = step1Controls.every(control => this.livraisonForm.get(control)?.valid);
      
      if (!step1Valid) {
        step1Controls.forEach(control => this.livraisonForm.get(control)?.markAsTouched());
        this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
        return;
      }
    }

    // Validation étape 2 + calcul tarif
    if (this.currentStep === 2) {
      const step2Controls = ['descriptionProduit', 'montantProduit'];
      const step2Valid = step2Controls.every(control => this.livraisonForm.get(control)?.valid);
      
      if (!step2Valid) {
        step2Controls.forEach(control => this.livraisonForm.get(control)?.markAsTouched());
        this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
        return;
      }

      // Recalculer tarif pour étape 3
      this.calculatingTarif = true;
      const commune = this.livraisonForm.get('commune')?.value;
      const quartier = this.livraisonForm.get('quartier')?.value;
      const urgence = this.livraisonForm.get('urgence')?.value;

      // Trouver le zoneId
      this.zoneService.getZones(true, '', 0, 100).subscribe({
        next: (data) => {
          let zoneId: number | null = null;
          let zonesChecked = 0;
          
          data.content.forEach(zone => {
            this.zoneService.getZoneDetail(zone.id).subscribe({
              next: (detail) => {
                zonesChecked++;
                const hasCommune = detail.quartiers.some(q => q.commune === commune);
                
                if (hasCommune && !zoneId) {
                  zoneId = zone.id;
                  this.ZoneId = zone.id
                  
                  const request: CalculTarifRequest = {
                    zoneId: zoneId,
                    communeDepart: 'Dakar',
                    quartierDepart: 'Plateau',
                    communeDestination: commune,
                    quartierDestination: quartier,
                    montantCOD: 0,
                    urgence: urgence
                  };

                  this.apiService.calculerTarif(request).subscribe({
                    next: (tarif) => {
                      this.tarif = tarif;
                      this.calculatingTarif = false;
                      this.currentStep++;
                      this.errorMessage = '';

                      console.log('TARIFFFF :', this.tarif)
                    },
                    error: () => {
                      this.toastService.error('Erreur lors du calcul du tarif');
                      this.calculatingTarif = false;
                    }
                  });
                } else if (zonesChecked === data.content.length && !zoneId) {
                  this.toastService.error('Zone non trouvée pour cette commune');
                  this.calculatingTarif = false;
                }
              }
            });
          });
        },
        error: () => {
          this.toastService.error('Erreur lors du calcul du tarif');
          this.calculatingTarif = false;
        }
      });
      return;
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
    if (this.livraisonForm.invalid || !this.tarif || !this.selectedVendeur) {
      this.errorMessage = 'Veuillez remplir correctement le formulaire';
      return;
    }

    const formValue = this.livraisonForm.value;
    const montantCOD = this.montantCODTotal;

    const request: CreateLivraisonRequest = {
      telephoneVendeur: this.selectedVendeur.telephone, 
      nomClient: formValue.nomClient,
      telephoneClient: formValue.telephoneClient,
      commune: formValue.commune,
      quartier: formValue.quartier,
      adresseComplete: formValue.adresseComplete,
      pointRepere: formValue.pointRepere || undefined,
      descriptionProduit: formValue.descriptionProduit,
      produitId: formValue.produitId || undefined,
      quantite: formValue.produitId ? (formValue.quantite || 1) : undefined,
      fragile: formValue.fragile,
      poids: formValue.poidsEstime || undefined,
      montantCOD: montantCOD,
      zoneId: this.ZoneId,
      urgence: formValue.urgence,
      creneauSouhaite: formValue.creneauSouhaite || undefined,
      notesPourLivreur: formValue.notesLivreur || undefined
    };

    this.loading = true;
    
    // Créer la livraison
    this.apiService.creerLivraison(request).subscribe({
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
    this.router.navigate(['/admin/livraisons']);
  }

  resetForm() {
    this.currentStep = 0;
    this.selectedVendeur = null;
    this.createdLivraison = null;
    this.searchVendeurTerm = '';
    this.vendeurs = [];
    this.hasSearched = false;
    this.livraisonForm.reset({
      urgence: 'NORMAL',
      fragile: false,
      montantProduit: 0
    });
  }
}