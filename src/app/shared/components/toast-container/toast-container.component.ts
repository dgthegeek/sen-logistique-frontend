import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[10000] space-y-2">
      <div
        *ngFor="let toast of toasts"
        class="border rounded-lg p-4 shadow-lg flex items-center gap-3 min-w-[300px] max-w-md animate-slideIn"
        [ngClass]="getToastClass(toast.type)"
      >
        <div class="text-2xl">{{ getIcon(toast.type) }}</div>
        <div class="flex-1 text-sm font-medium">{{ toast.message }}</div>
        <button
          (click)="remove(toast.id)"
          class="text-xl hover:opacity-70 transition-opacity"
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
}