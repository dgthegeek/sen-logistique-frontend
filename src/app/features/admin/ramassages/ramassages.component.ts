import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RamassagesTodayResponse, RamassageZone, RamassageVendeur, RamassageColis } from '../../../core/models/admin.model';

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
  
  expandedZones: Set<number> = new Set();
  expandedVendeurs: Set<number> = new Set();
  selectedColis: Set<number> = new Set();
  
  processingRamassage = false;
  generatingQR = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadRamassages();
  }

  loadRamassages() {
    this.loading = true;
    this.errorMessage = '';
    
    this.apiService.getRamassagesToday().subscribe({
      next: (data) => {
        this.ramassages = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement ramassages:', error);
        this.errorMessage = error.error?.message || 'Impossible de charger les ramassages';
        this.loading = false;
      }
    });
  }

  toggleZone(zoneId: number) {
    if (this.expandedZones.has(zoneId)) {
      this.expandedZones.delete(zoneId);
    } else {
      this.expandedZones.add(zoneId);
    }
  }

  toggleVendeur(vendeurId: number) {
    if (this.expandedVendeurs.has(vendeurId)) {
      this.expandedVendeurs.delete(vendeurId);
    } else {
      this.expandedVendeurs.add(vendeurId);
    }
  }

  isZoneExpanded(zoneId: number): boolean {
    return this.expandedZones.has(zoneId);
  }

  isVendeurExpanded(vendeurId: number): boolean {
    return this.expandedVendeurs.has(vendeurId);
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
      alert('Veuillez sélectionner au moins un colis');
      return;
    }

    if (!confirm(`Marquer ${this.selectedColis.size} colis comme ramassés ?`)) {
      return;
    }

    this.processingRamassage = true;

    this.apiService.marquerRamasse({
      livraisonIds: Array.from(this.selectedColis)
    }).subscribe({
      next: (response) => {
        alert(response.message);
        this.selectedColis.clear();
        this.loadRamassages();
        this.processingRamassage = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        alert(error.error?.message || 'Erreur lors du marquage');
        this.processingRamassage = false;
      }
    });
  }

  imprimerQRCodes() {
    if (this.selectedColis.size === 0) {
      alert('Veuillez sélectionner au moins un colis');
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
        alert('Erreur lors de la génération des QR codes');
        this.generatingQR = false;
      }
    });
  }

  callVendeur(telephone: string) {
    window.location.href = `tel:${telephone}`;
  }

  openMaps(adresse: string, commune: string, quartier: string) {
    const fullAddress = encodeURIComponent(`${adresse}, ${quartier}, ${commune}, Sénégal`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${fullAddress}`, '_blank');
  }
}