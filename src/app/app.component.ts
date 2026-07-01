import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationModalComponent } from './shared/components/confirmation-modal/confirmation-modal.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { ThemeService } from './core/services/theme.service';

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

  // L'injection initialise le thème (applique .dark selon la préférence) au démarrage
  constructor(private themeService: ThemeService) {}
}