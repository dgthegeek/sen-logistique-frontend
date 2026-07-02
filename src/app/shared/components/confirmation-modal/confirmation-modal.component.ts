import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, ConfirmationConfig } from '../../../core/services/confirmation.service';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent {
  showModal = false;
  config: ConfirmationConfig | null = null;
  inputValue = '';

  constructor(public confirmationService: ConfirmationService) {
    this.confirmationService.showModal$.subscribe(show => {
      this.showModal = show;
    });

    this.confirmationService.config$.subscribe(config => {
      this.config = config;
      this.inputValue = config?.input?.value || '';
    });
  }

  get confirmDisabled(): boolean {
    return !!this.config?.input?.required && !this.inputValue.trim();
  }

  onConfirm() {
    if (this.confirmDisabled) { return; }
    this.confirmationService.handleConfirm(this.inputValue.trim() || undefined);
  }

  onCancel() {
    this.confirmationService.handleCancel();
  }

  getIconClass(): string {
    switch (this.config?.type) {
      case 'success':
        return 'bg-green-100 text-green-600';
      case 'warning':
        return 'bg-orange-100 text-orange-600';
      case 'danger':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  }

  getIcon(): string {
    switch (this.config?.type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'danger':
        return '⚠';
      default:
        return 'ℹ';
    }
  }

  getConfirmButtonClass(): string {
    switch (this.config?.type) {
      case 'danger':
        return 'btn-destructive';
      default:
        return 'btn-primary';
    }
  }
}