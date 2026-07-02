import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmationInput {
  label?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
}

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  /** Champ de saisie optionnel affiché dans la modale (remplace les prompt() navigateur). */
  input?: ConfirmationInput;
  onConfirm: (inputValue?: string) => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private showModalSubject = new BehaviorSubject<boolean>(false);
  private configSubject = new BehaviorSubject<ConfirmationConfig | null>(null);

  public showModal$ = this.showModalSubject.asObservable();
  public config$ = this.configSubject.asObservable();

  confirm(config: ConfirmationConfig) {
    this.configSubject.next({
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      type: 'info',
      ...config
    });
    this.showModalSubject.next(true);
  }

  hide() {
    this.showModalSubject.next(false);
    setTimeout(() => {
      this.configSubject.next(null);
    }, 300);
  }

  handleConfirm(inputValue?: string) {
    const config = this.configSubject.value;
    if (config?.onConfirm) {
      config.onConfirm(inputValue);
    }
    this.hide();
  }

  handleCancel() {
    const config = this.configSubject.value;
    if (config?.onCancel) {
      config.onCancel();
    }
    this.hide();
  }
}