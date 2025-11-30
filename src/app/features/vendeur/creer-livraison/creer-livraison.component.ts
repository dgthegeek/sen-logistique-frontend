import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { Zone, Quartier, CalculTarifResponse, CreateLivraisonResponse, CreateLivraisonRequest } from '../../../core/models/livraison.model';

@Component({
  selector: 'app-creer-livraison',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent, SidebarComponent, FcfaPipe],
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
  
  tarif: CalculTarifResponse | null = null;
  calculatingTarif = false;
  
  loading = false;
  errorMessage = '';
  
  createdLivraison: CreateLivraisonResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.livraisonForm = this.fb.group({
      // Étape 1: Infos client
      nomClient: ['', Validators.required],
      telephoneClient: ['', [
        Validators.required,
        Validators.pattern(/^(77|78|76|70|75)\d{7}$/)
      ]],
      commune: ['', Validators.required],
      quartier: ['', Validators.required],
      adresseComplete: ['', Validators.required],
      pointRepere: [''],
      
      // Étape 2: Détails colis
      descriptionProduit: ['', Validators.required],
      fragile: [false],
      poidsEstime: [''],
      montantCOD: [0, [Validators.required, Validators.min(0)]],
      urgence: ['NORMAL', Validators.required],
      notesPourLivreur: ['']
    });
  }

  ngOnInit() {
    this.loadZones();
    
    this.livraisonForm.get('commune')?.valueChanges.subscribe(commune => {
      if (commune) {
        this.loadQuartiers(commune);
      }
    });
    
    this.livraisonForm.get('montantCOD')?.valueChanges.subscribe(() => {
      if (this.currentStep === 3) {
        this.calculerTarif();
      }
    });
    
    this.livraisonForm.get('urgence')?.valueChanges.subscribe(() => {
      if (this.currentStep === 3) {
        this.calculerTarif();
      }
    });
  }

  loadZones() {
    this.apiService.getZones().subscribe({
      next: (zones) => {
        this.zones = zones;
        const allCommunes = zones.flatMap(z => z.communes);
        this.communes = [...new Set(allCommunes)].sort();
        console.log('✅ Zones chargées:', zones);
        console.log('✅ Communes disponibles:', this.communes);
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
        console.error('Erreur chargement quartiers:', error);
      }
    });
  }

  getZoneIdByCommune(commune: string): number | null {
    const zone = this.zones.find(z => z.communes.includes(commune));
    if (zone) {
      console.log(`✅ Zone trouvée pour ${commune}:`, zone.nom, 'ID:', zone.id);
      return zone.id;
    }
    console.warn(`⚠️ Aucune zone trouvée pour la commune: ${commune}`);
    return null;
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
      const step2Fields = ['descriptionProduit', 'montantCOD', 'urgence'];
      const step2Valid = step2Fields.every(field => this.livraisonForm.get(field)?.valid);
      
      if (!step2Valid) {
        this.markFieldsAsTouched(step2Fields);
        return;
      }
      
      this.currentStep = 3;
      this.calculerTarif();
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

  calculerTarif() {
    const formValue = this.livraisonForm.value;
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const zoneId = this.getZoneIdByCommune(formValue.commune);
    
    if (!zoneId) {
      this.errorMessage = `Impossible de trouver la zone pour la commune: ${formValue.commune}`;
      return;
    }
    
    this.calculatingTarif = true;
    this.errorMessage = '';
    
    this.apiService.calculerTarif({
      zoneId: zoneId,
      communeDepart: currentUser.commune || 'Dakar',
      quartierDepart: currentUser.quartier || 'Plateau',
      communeDestination: formValue.commune,
      quartierDestination: formValue.quartier,
      montantCOD: formValue.montantCOD,
      urgence: formValue.urgence
    }).subscribe({
      next: (response) => {
        this.tarif = response;
        this.calculatingTarif = false;
      },
      error: (error) => {
        console.error('Erreur calcul tarif:', error);
        this.calculatingTarif = false;
        this.errorMessage = error.error?.message || 'Impossible de calculer le tarif';
      }
    });
  }

  onSubmit() {
    if (this.livraisonForm.invalid) {
      return;
    }

    const formValue = this.livraisonForm.value;
    const zoneId = this.getZoneIdByCommune(formValue.commune);
    
    if (!zoneId) {
      this.errorMessage = `Zone introuvable pour la commune: ${formValue.commune}`;
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const request: CreateLivraisonRequest = {
      nomClient: formValue.nomClient,
      telephoneClient: formValue.telephoneClient,
      commune: formValue.commune,
      quartier: formValue.quartier,
      adresseComplete: formValue.adresseComplete,
      pointRepere: formValue.pointRepere || undefined,
      descriptionProduit: formValue.descriptionProduit,
      fragile: formValue.fragile,
      poids: formValue.poidsEstime || undefined,
      montantCOD: formValue.montantCOD,
      zoneId: zoneId,
      urgence: formValue.urgence,
      notesPourLivreur: formValue.notesPourLivreur || undefined
    };

    console.log('📦 Création livraison:', request);

    this.apiService.creerLivraison(request).subscribe({
      next: (response) => {
        console.log('✅ Livraison créée:', response);
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