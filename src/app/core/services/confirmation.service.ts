import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  onConfirm: () => void;
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

  handleConfirm() {
    const config = this.configSubject.value;
    if (config?.onConfirm) {
      config.onConfirm();
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