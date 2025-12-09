import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationModalComponent } from './shared/components/confirmation-modal/confirmation-modal.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    ConfirmationModalComponent,  // ← Modal de confirmation
    ToastContainerComponent      // ← Toasts (notifications)
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'sen-logistique-frontend';
}