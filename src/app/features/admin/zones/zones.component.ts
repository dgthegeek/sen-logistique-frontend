// src/app/features/admin/zones/zones.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ZoneService } from '../../../core/services/zone.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { ZoneAdminDTO, ZoneDetailDTO, CreateZoneRequest, UpdateZoneRequest } from '../../../core/models/zone.model';
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

  // Modal
  showModal = false;
  modalMode: 'create' | 'edit' | 'detail' = 'create';
  zoneForm!: FormGroup;
  selectedZone: ZoneAdminDTO | null = null;
  zoneDetail: ZoneDetailDTO | null = null;

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
    this.zoneForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      tarifStandard: [0, [Validators.required, Validators.min(0.01)]],
      tarifExpress: [0, [Validators.required, Validators.min(0.01)]],
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
        error: (error) => {
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

  // Modal Management
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

  // CRUD Operations
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
}