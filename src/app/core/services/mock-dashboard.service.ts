import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { VendeurDashboard } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class MockDashboardService {
  getMockDashboard(): Observable<VendeurDashboard> {
    const mockData: VendeurDashboard = {
      statistiquesJour: {
        totalColis: 12,
        colisLivres: 8,
        colisEnCours: 3,
        colisEchec: 1
      },
      finances: {
        soldeEnAttente: 145000,
        prochainPaiement: "Sur demande"
      },
      dernieresLivraisons: [
        {
          id: 1,
          numeroTracking: 'DKR-20251129-00001',
          nomClient: 'Fatou Diop',
          destination: 'Sacré-Cœur, Villa 45',
          montantCOD: 35000,
          statut: 'LIVREE',
          dateCreation: new Date('2024-11-29T10:30:00')
        },
        {
          id: 2,
          numeroTracking: 'DKR-20251129-00002',
          nomClient: 'Moussa Sow',
          destination: 'Mermoz, Rue 12',
          montantCOD: 12500,
          statut: 'EN_ROUTE',
          dateCreation: new Date('2024-11-29T11:15:00')
        },
        {
          id: 3,
          numeroTracking: 'DKR-20251129-00003',
          nomClient: 'Aïssatou Ndiaye',
          destination: 'Almadies, Résidence Azur',
          montantCOD: 48000,
          statut: 'RAMASSE',
          dateCreation: new Date('2024-11-29T12:00:00')
        }
      ]
    };

    return of(mockData);
  }
}