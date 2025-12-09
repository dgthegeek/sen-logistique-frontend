import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RamassagesTodayResponse, RamassageZone, RamassageVendeur, RamassageColis } from '../../../core/models/admin.model';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';

@Component({
  selector: 'app-ramassages',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  templateUrl: './ramassages.component.html',
  styleUrls: ['./ramassages.component.css']
})
export class RamassagesComponent implements OnInit {
  ramassages: RamassagesTodayResponse | null = null;
  loading = true;
  errorMessage = '';

  expandedZones: Set<string> = new Set(); // ← string au lieu de number
  expandedVendeurs: Set<number> = new Set();
  selectedColis: Set<number> = new Set();

  processingRamassage = false;
  generatingQR = false;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit() {
    this.loadRamassages();
  }

  loadRamassages() {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.getRamassagesARamasser().subscribe({
      next: (data) => {
        this.ramassages = data;
        this.loading = false;
        console.log("colis: ", data)
      },
      error: (error) => {
        console.error('Erreur chargement ramassages:', error);
        this.errorMessage = error.error?.message || 'Impossible de charger les ramassages';
        this.loading = false;
      }
    });
  }

  toggleZone(zone: string) { // ← string
    if (this.expandedZones.has(zone)) {
      this.expandedZones.delete(zone);
    } else {
      this.expandedZones.add(zone);
    }
  }

  isZoneExpanded(zone: string): boolean { // ← string
    return this.expandedZones.has(zone);
  }

  // Méthodes vendeurs
  toggleVendeur(vendeurId: number) {
    if (this.expandedVendeurs.has(vendeurId)) {
      this.expandedVendeurs.delete(vendeurId);
    } else {
      this.expandedVendeurs.add(vendeurId);
    }
  }

  isVendeurExpanded(vendeurId: number): boolean {
    return this.expandedVendeurs.has(vendeurId);
  }

  // Maps
  openMaps(adresse: string) {
    const fullAddress = encodeURIComponent(`${adresse}, Dakar, Sénégal`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${fullAddress}`, '_blank');
  }

  toggleColis(colisId: number) {
    if (this.selectedColis.has(colisId)) {
      this.selectedColis.delete(colisId);
    } else {
      this.selectedColis.add(colisId);
    }
  }

  isColisSelected(colisId: number): boolean {
    return this.selectedColis.has(colisId);
  }

  selectAllColisVendeur(vendeur: RamassageVendeur) {
    const allSelected = vendeur.colis.every(c => this.selectedColis.has(c.id));

    if (allSelected) {
      vendeur.colis.forEach(c => this.selectedColis.delete(c.id));
    } else {
      vendeur.colis.forEach(c => this.selectedColis.add(c.id));
    }
  }

  selectAllColisZone(zone: RamassageZone) {
    const allColis: number[] = [];
    zone.vendeurs.forEach(v => {
      v.colis.forEach(c => allColis.push(c.id));
    });

    const allSelected = allColis.every(id => this.selectedColis.has(id));

    if (allSelected) {
      allColis.forEach(id => this.selectedColis.delete(id));
    } else {
      allColis.forEach(id => this.selectedColis.add(id));
    }
  }

  marquerRamasse() {
    if (this.selectedColis.size === 0) {
      this.toastService.warning('Veuillez sélectionner au moins un colis');
      return;
    }

    // ✅ UTILISER ConfirmationService au lieu de confirm()
    this.confirmationService.confirm({
      title: 'Marquer comme ramassé',
      message: `Confirmer le ramassage de ${this.selectedColis.size} colis ?`,
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      type: 'success',
      onConfirm: () => {
        this.executeMarquerRamasse();
      }
    });
  }

  // Séparer la logique d'exécution
  executeMarquerRamasse() {
    this.processingRamassage = true;

    this.apiService.marquerRamasse({
      livraisonIds: Array.from(this.selectedColis)
    }).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.selectedColis.clear();
        this.loadRamassages();
        this.processingRamassage = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.toastService.error(error.error?.message || 'Erreur lors du marquage');
        this.processingRamassage = false;
      }
    });
  }

  imprimerQRCodes() {
    if (this.selectedColis.size === 0) {
      this.toastService.warning('Veuillez sélectionner au moins un colis');
      return;
    }

    this.generatingQR = true;

    this.apiService.imprimerQRCodes(Array.from(this.selectedColis)).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-codes-${new Date().getTime()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.generatingQR = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.toastService.error('Erreur lors de la génération des QR codes');
        this.generatingQR = false;
      }
    });
  }

  callVendeur(telephone: string) {
    window.location.href = `tel:${telephone}`;
  }


}