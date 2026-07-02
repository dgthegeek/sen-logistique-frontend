import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-3 right-3 left-3 sm:left-auto z-[10000] space-y-2 pointer-events-none flex flex-col items-end">
      <div
        *ngFor="let toast of toasts"
        class="pointer-events-auto border rounded-lg px-3 py-2.5 shadow-lg flex items-center gap-2.5 w-full sm:w-auto sm:min-w-[240px] max-w-sm animate-slideIn"
        [ngClass]="getToastClass(toast.type)"
      >
        <div class="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
             [ngClass]="getIconBadgeClass(toast.type)">{{ getIcon(toast.type) }}</div>
        <div class="flex-1 text-xs sm:text-sm font-medium leading-snug">{{ toast.message }}</div>
        <button
          (click)="remove(toast.id)"
          class="text-lg leading-none hover:opacity-70 transition-opacity flex-shrink-0"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slideIn {
      animation: slideIn 0.3s ease-out;
    }
  `]
})
export class ToastContainerComponent {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  remove(id: number) {
    this.toastService.remove(id);
  }

  getToastClass(type: Toast['type']): string {
    const classes = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-orange-50 border-orange-200 text-orange-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };
    return classes[type];
  }

  getIcon(type: Toast['type']): string {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type];
  }

  getIconBadgeClass(type: Toast['type']): string {
    const classes = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-orange-500 text-white',
      info: 'bg-blue-500 text-white'
    };
    return classes[type];
  }
}