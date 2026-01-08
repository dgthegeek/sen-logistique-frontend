// src/app/features/admin/zones/zones.component.ts - VERSION COMPLÈTE AVEC QUARTIERS

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ZoneService } from '../../../core/services/zone.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import {
  ZoneAdminDTO, ZoneDetailDTO, CreateZoneRequest, UpdateZoneRequest,
  CreateQuartierRequest, UpdateQuartierRequest, QuartierDTO
} from '../../../core/models/zone.model';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-zones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HeaderComponent, SidebarComponent],
  templateUrl: './zones.component.html',
  styleUrls: ['./zones.component.css']
})
export class ZonesComponent implements OnInit {
  zones: ZoneAdminDTO[] = [];
  loading = false;
  searchTerm = '';
  filterActif: boolean | undefined = undefined;

  // Pagination
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;

  // Modal Zones
  showModal = false;
  modalMode: 'create' | 'edit' | 'detail' = 'create';
  zoneForm!: FormGroup;
  selectedZone: ZoneAdminDTO | null = null;
  zoneDetail: ZoneDetailDTO | null = null;

  // Modal Quartiers
  showQuartierModal = false;
  quartierModalMode: 'create' | 'edit' = 'create';
  quartierForm!: FormGroup;
  selectedQuartier: QuartierDTO | null = null;
  currentZoneForQuartier: ZoneDetailDTO | null = null;

  constructor(
    private zoneService: ZoneService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {
    this.initForms();
  }

  ngOnInit() {
    this.loadZones();
  }

  initForms() {
    // Form Zone
    this.zoneForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      tarifStandard: [0, [Validators.required, Validators.min(0.01)]],
      tarifExpress: [0, [Validators.required, Validators.min(0.01)]],
      actif: [true]
    });

    // Form Quartier
    this.quartierForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      commune: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      zoneId: [0, [Validators.required]],
      actif: [true]
    });
  }

  loadZones() {
    this.loading = true;
    this.zoneService.getZones(this.filterActif, this.searchTerm, this.currentPage, this.pageSize)
      .subscribe({
        next: (data) => {
          this.zones = data.content;
          this.currentPage = data.page;
          this.pageSize = data.size;
          this.totalElements = data.totalElements;
          this.totalPages = data.totalPages;
          this.loading = false;
        },
        error: () => {
          this.toastService.error('Erreur lors du chargement des zones');
          this.loading = false;
        }
      });
  }

  onSearch() {
    this.currentPage = 0;
    this.loadZones();
  }

  onFilterChange(actif: boolean | undefined) {
    this.filterActif = actif;
    this.currentPage = 0;
    this.loadZones();
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadZones();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadZones();
    }
  }

  // ========== MODAL ZONES ==========

  openCreateModal() {
    this.modalMode = 'create';
    this.zoneForm.reset({ actif: true });
    this.showModal = true;
  }

  openEditModal(zone: ZoneAdminDTO) {
    this.modalMode = 'edit';
    this.selectedZone = zone;
    this.zoneForm.patchValue({
      nom: zone.nom,
      description: zone.description,
      tarifStandard: zone.tarifStandard,
      tarifExpress: zone.tarifExpress,
      actif: zone.actif
    });
    this.showModal = true;
  }

  openDetailModal(zone: ZoneAdminDTO) {
    this.modalMode = 'detail';
    this.loading = true;
    this.zoneService.getZoneDetail(zone.id).subscribe({
      next: (detail) => {
        this.zoneDetail = detail;
        this.currentZoneForQuartier = detail;
        this.loading = false;
        this.showModal = true;
      },
      error: () => {
        this.toastService.error('Erreur lors du chargement des détails');
        this.loading = false;
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedZone = null;
    this.zoneDetail = null;
    this.zoneForm.reset();
  }

  // ========== CRUD ZONES ==========

  createZone() {
    if (this.zoneForm.invalid) return;

    const request: CreateZoneRequest = this.zoneForm.value;
    this.loading = true;

    this.zoneService.createZone(request).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.closeModal();
        this.loadZones();
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Erreur lors de la création');
        this.loading = false;
      }
    });
  }

  updateZone() {
    if (this.zoneForm.invalid || !this.selectedZone) return;

    const request: UpdateZoneRequest = this.zoneForm.value;
    this.loading = true;

    this.zoneService.updateZone(this.selectedZone.id, request).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.closeModal();
        this.loadZones();
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Erreur lors de la modification');
        this.loading = false;
      }
    });
  }

  toggleZone(zone: ZoneAdminDTO) {
    const action = zone.actif ? 'désactiver' : 'activer';

    this.confirmationService.confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} la zone`,
      message: `Voulez-vous vraiment ${action} "${zone.nom}" ?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      cancelText: 'Annuler',
      type: zone.actif ? 'warning' : 'success',
      onConfirm: () => {
        this.executeToggleZone(zone.id);
      }
    });
  }

  private executeToggleZone(id: number) {
    this.zoneService.toggleZone(id).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.loadZones();
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Erreur lors du changement de statut');
      }
    });
  }

  deleteZone(zone: ZoneAdminDTO) {
    this.confirmationService.confirm({
      title: 'Supprimer la zone',
      message: `Voulez-vous vraiment supprimer "${zone.nom}" ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger',
      onConfirm: () => {
        this.executeDeleteZone(zone.id);
      }
    });
  }

  private executeDeleteZone(id: number) {
    this.zoneService.deleteZone(id).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.loadZones();
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Impossible de supprimer cette zone');
      }
    });
  }

  onSubmit() {
    if (this.modalMode === 'create') {
      this.createZone();
    } else if (this.modalMode === 'edit') {
      this.updateZone();
    }
  }

  // ========== MODAL QUARTIERS ==========

  openCreateQuartierModal() {
    if (!this.currentZoneForQuartier) {
      this.toastService.error('Veuillez d\'abord afficher les détails d\'une zone');
      return;
    }

    this.quartierModalMode = 'create';
    this.quartierForm.reset({
      zoneId: this.currentZoneForQuartier.id,
      actif: true
    });
    this.showQuartierModal = true;
  }

  openEditQuartierModal(quartier: any) {  // ← Changer QuartierDTO en any
    this.quartierModalMode = 'edit';
    this.selectedQuartier = quartier;
    this.quartierForm.patchValue({
      nom: quartier.nom,
      commune: quartier.commune,
      zoneId: quartier.zone?.id || this.currentZoneForQuartier?.id || 0,  // ← Fallback sur currentZoneForQuartier
      actif: quartier.actif
    });
    this.showQuartierModal = true;
  }

  closeQuartierModal() {
    this.showQuartierModal = false;
    this.selectedQuartier = null;
    this.quartierForm.reset();
  }

  // ========== CRUD QUARTIERS ==========

  createQuartier() {
    if (this.quartierForm.invalid) return;

    const request: CreateQuartierRequest = this.quartierForm.value;
    this.loading = true;

    this.zoneService.createQuartier(request).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.closeQuartierModal();
        // Recharger détails zone
        if (this.currentZoneForQuartier) {
          this.refreshZoneDetail(this.currentZoneForQuartier.id);
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Erreur lors de la création');
        this.loading = false;
      }
    });
  }

  updateQuartier() {
    if (this.quartierForm.invalid || !this.selectedQuartier) return;

    const request: UpdateQuartierRequest = this.quartierForm.value;
    this.loading = true;

    this.zoneService.updateQuartier(this.selectedQuartier.id, request).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.closeQuartierModal();
        // Recharger détails zone
        if (this.currentZoneForQuartier) {
          this.refreshZoneDetail(this.currentZoneForQuartier.id);
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Erreur lors de la modification');
        this.loading = false;
      }
    });
  }

  toggleQuartier(quartier: any) {  
    const action = quartier.actif ? 'désactiver' : 'activer';

    this.confirmationService.confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} le quartier`,
      message: `Voulez-vous vraiment ${action} "${quartier.nom}" ?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      cancelText: 'Annuler',
      type: quartier.actif ? 'warning' : 'success',
      onConfirm: () => {
        this.executeToggleQuartier(quartier.id);
      }
    });
  }


  private executeToggleQuartier(id: number) {
    this.zoneService.toggleQuartier(id).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        // Recharger détails zone
        if (this.currentZoneForQuartier) {
          this.refreshZoneDetail(this.currentZoneForQuartier.id);
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Erreur lors du changement de statut');
      }
    });
  }

  deleteQuartier(quartier: any) {  
    this.confirmationService.confirm({
      title: 'Supprimer le quartier',
      message: `Voulez-vous vraiment supprimer "${quartier.nom}" ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger',
      onConfirm: () => {
        this.executeDeleteQuartier(quartier.id);
      }
    });
  }

  private executeDeleteQuartier(id: number) {
    this.zoneService.deleteQuartier(id).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        // Recharger détails zone
        if (this.currentZoneForQuartier) {
          this.refreshZoneDetail(this.currentZoneForQuartier.id);
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Impossible de supprimer ce quartier');
      }
    });
  }

  onQuartierSubmit() {
    if (this.quartierModalMode === 'create') {
      this.createQuartier();
    } else {
      this.updateQuartier();
    }
  }

  // ========== HELPERS ==========

  private refreshZoneDetail(zoneId: number) {
    this.zoneService.getZoneDetail(zoneId).subscribe({
      next: (detail) => {
        this.zoneDetail = detail;
        this.currentZoneForQuartier = detail;
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Erreur lors du rechargement');
        this.loading = false;
      }
    });
  }
}