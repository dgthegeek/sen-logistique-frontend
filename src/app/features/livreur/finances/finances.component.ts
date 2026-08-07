import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { LivreurFinances } from '../../../core/models/finance-livreur.model';

/**
 * Vue financière personnelle du livreur : chiffre d'affaires encaissé (cash COD),
 * ce qui a déjà été reversé et ce qu'il reste à régler, + historique de ses versements.
 */
@Component({
  selector: 'app-livreur-finances',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './finances.component.html',
  styleUrls: ['./finances.component.css']
})
export class LivreurFinancesComponent implements OnInit {
  finances: LivreurFinances | null = null;
  loading = true;
  loadError = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.loadError = false;
    this.api.getLivreurFinances().subscribe({
      next: (data) => { this.finances = data; this.loading = false; },
      error: () => { this.loadError = true; this.loading = false; }
    });
  }
}
