import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ProfilService } from '../../../core/services/profile.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { Zone, Quartier, CalculTarifResponse, CreateLivraisonResponse, CreateLivraisonRequest } from '../../../core/models/livraison.model';
import { Produit } from '../../../core/models/stock.model';

@Component({
  selector: 'app-creer-livraison',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './creer-livraison.component.html',
  styleUrls: ['./creer-livraison.component.css']
})
export class CreerLivraisonComponent implements OnInit {
  currentStep = 1;
  livraisonForm: FormGroup;
  
  communes: string[] = [];
  zones: Zone[] = [];
  quartiers: Quartier[] = [];
  filteredQuartiers: Quartier[] = [];
  
  // Commission fixe du vendeur = prix de livraison (ajouté au COD, invisible pour lui)
  commissionFixe = 0;

  loading = false;
  errorMessage = '';
  
  createdLivraison: CreateLivraisonResponse | null = null;

  produits: Produit[] = [];

  // Panier multi-produits (optionnel)
  panier: { produitId: number; nom: string; prix: number; quantite: number }[] = [];
  selProduitId: number | null = null;
  selQuantite = 1;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private profilService: ProfilService,
    private router: Router
  ) {
    this.livraisonForm = this.fb.group({
      // Étape 1: Infos client
      nomClient: ['', Validators.required],
      telephoneClient: ['', [
        Validators.required,
        Validators.pattern(/^\+?[0-9]{9,}$/)
      ]],
      commune: ['', Validators.required],
      quartier: ['', Validators.required],
      adresseComplete: ['', Validators.required],
      pointRepere: [''],
      
      // Étape 2: Détails colis
      descriptionProduit: ['', Validators.required],
      fragile: [false],
      poidsEstime: [''],
      // Prix calculé automatiquement à partir des produits sélectionnés (panier)
      montantProduit: [0, [Validators.required, Validators.min(1)]],
      urgence: ['NORMAL', Validators.required],
      creneauSouhaite: [''],
      notesLivreur: ['']
    });
  }

  ngOnInit() {
    this.loadZones();
    this.loadMesProduits();
    this.loadCommission();

    // WATCH: Commune → suggestions de quartiers (facultatif, saisie libre)
    this.livraisonForm.get('commune')?.valueChanges.subscribe(commune => {
      if (commune) {
        this.loadQuartiers(commune);
      }
    });
  }

  /** Charge la commission fixe du vendeur (prix de livraison ajouté au COD). */
  loadCommission() {
    this.profilService.getProfil().subscribe({
      next: (p) => { this.commissionFixe = p.commissionFixe || 0; },
      error: () => { this.commissionFixe = 0; }
    });
  }

  loadMesProduits() {
    this.apiService.getMesProduits().subscribe({
      next: (produits) => this.produits = produits.filter(p => p.actif),
      error: () => {}
    });
  }

  get produitsTotal(): number {
    return this.panier.reduce((t, l) => t + (l.prix * l.quantite), 0);
  }

  ajouterAuPanier() {
    const produit = this.produits.find(p => p.id === this.selProduitId);
    if (!produit) { return; }

    const stock = produit.quantiteStock || 0;
    if (stock <= 0) {
      this.errorMessage = `« ${produit.nom} » est en rupture de stock et ne peut pas être commandé.`;
      return;
    }

    const qte = this.selQuantite && this.selQuantite > 0 ? this.selQuantite : 1;
    const existant = this.panier.find(l => l.produitId === produit.id);
    const dejaAuPanier = existant ? existant.quantite : 0;
    if (dejaAuPanier + qte > stock) {
      this.errorMessage = `Stock insuffisant pour « ${produit.nom} » : ${stock} disponible(s).`;
      return;
    }

    this.errorMessage = '';
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

  retirerDuPanier(index: number) {
    this.panier.splice(index, 1);
    this.syncPanier();
  }

  private syncPanier() {
    // Le prix de la commande est toujours le total des produits sélectionnés.
    // Si le panier est vidé, on remet le montant et la description à zéro.
    this.livraisonForm.patchValue({
      montantProduit: this.produitsTotal,
      descriptionProduit: this.panier.length > 0
        ? this.panier.map(l => `${l.quantite}x ${l.nom}`).join(', ')
        : ''
    });
  }

  loadZones() {
    this.apiService.getZones().subscribe({
      next: (zones) => {
        this.zones = zones;
        const allCommunes = zones.flatMap(z => z.communes);
        this.communes = [...new Set(allCommunes)].sort();
      },
      error: (error) => {
        console.error('❌ Erreur chargement zones:', error);
        this.communes = ['Dakar', 'Pikine', 'Guédiawaye', 'Rufisque'];
      }
    });
  }

  loadQuartiers(commune: string) {
    this.apiService.getQuartiersByCommune(commune).subscribe({
      next: (quartiers) => {
        this.quartiers = quartiers;
        this.filteredQuartiers = quartiers;
      },
      error: (error) => {
        console.error('❌ Erreur chargement quartiers:', error);
        this.filteredQuartiers = [];
      }
    });
  }

  getZoneIdByCommune(commune: string): number | null {
    const zone = this.zones.find(z => z.communes.includes(commune));
    return zone ? zone.id : null;
  }

  // COD total = prix produit (ce que le vendeur reçoit) + commission fixe (prix de
  // livraison, payé en plus par le client). La commission n'est pas montrée au vendeur.
  get montantCODTotal(): number {
    const montantProduit = this.livraisonForm.get('montantProduit')?.value || 0;
    return montantProduit + (this.commissionFixe || 0);
  }

  nextStep() {
    if (this.currentStep === 1) {
      const step1Fields = ['nomClient', 'telephoneClient', 'commune', 'quartier', 'adresseComplete'];
      const step1Valid = step1Fields.every(field => this.livraisonForm.get(field)?.valid);
      
      if (!step1Valid) {
        this.markFieldsAsTouched(step1Fields);
        return;
      }
      
      this.currentStep = 2;
    } else if (this.currentStep === 2) {
      // Le prix vient des produits : il faut au moins un produit dans le panier
      if (this.panier.length === 0) {
        this.errorMessage = 'Ajoutez au moins un produit à la commande. Le prix est calculé automatiquement.';
        return;
      }

      const step2Fields = ['descriptionProduit', 'montantProduit', 'urgence'];
      const step2Valid = step2Fields.every(field => this.livraisonForm.get(field)?.valid);

      if (!step2Valid) {
        this.markFieldsAsTouched(step2Fields);
        return;
      }

      this.errorMessage = '';
      this.currentStep = 3;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  markFieldsAsTouched(fields: string[]) {
    fields.forEach(field => {
      this.livraisonForm.get(field)?.markAsTouched();
    });
  }

  onSubmit() {
    if (this.livraisonForm.invalid) {
      return;
    }

    const formValue = this.livraisonForm.value;
    // Adresses en saisie libre : la zone n'est plus requise (tarif = commission fixe).
    const zoneId = this.getZoneIdByCommune(formValue.commune) || undefined;

    this.loading = true;
    this.errorMessage = '';

    // COD = montantProduit + commission (prix de livraison)
    const montantCOD = this.montantCODTotal;

    const request: CreateLivraisonRequest = {
      
      nomClient: formValue.nomClient,
      telephoneClient: formValue.telephoneClient,
      commune: formValue.commune,
      quartier: formValue.quartier,
      adresseComplete: formValue.adresseComplete,
      pointRepere: formValue.pointRepere || undefined,
      descriptionProduit: formValue.descriptionProduit,
      items: this.panier.length > 0
        ? this.panier.map(l => ({ produitId: l.produitId, quantite: l.quantite }))
        : undefined,
      fragile: formValue.fragile,
      poids: formValue.poidsEstime || undefined,
      montantCOD: montantCOD, // ← COD TOTAL
      zoneId: zoneId,
      urgence: formValue.urgence,
      notesPourLivreur: formValue.notesLivreur || undefined
    };

    this.apiService.creerLivraison(request).subscribe({
      next: (response) => {
        this.createdLivraison = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur création livraison:', error);
        this.loading = false;
        this.errorMessage = error.error?.message || 'Impossible de créer la livraison. Veuillez réessayer.';
      }
    });
  }

  closeSuccessModal() {
    this.router.navigate(['/vendeur/livraisons']);
  }
}