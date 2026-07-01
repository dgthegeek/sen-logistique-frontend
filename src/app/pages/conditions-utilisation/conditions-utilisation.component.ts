import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicHeaderComponent } from '../../shared/components/public-header/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer/public-footer.component';

@Component({
  selector: 'app-conditions-utilisation',
  standalone: true,
  imports: [CommonModule, RouterModule, PublicHeaderComponent, PublicFooterComponent],
  templateUrl: './conditions-utilisation.component.html'
})
export class ConditionsUtilisationComponent {
  readonly derniereMaj = '30 juin 2026';
}
