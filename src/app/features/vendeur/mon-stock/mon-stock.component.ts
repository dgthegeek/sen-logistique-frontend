import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FcfaPipe } from '../../../shared/pipes/fcfa.pipe';
import { Produit } from '../../../core/models/stock.model';

@Component({
  selector: 'app-vendeur-mon-stock',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, FcfaPipe],
  templateUrl: './mon-stock.component.html',
  styleUrls: ['./mon-stock.component.css']
})
export class VendeurMonStockComponent implements OnInit {
  produits: Produit[] = [];
  loading = true;

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.api.getMesProduits().subscribe({
      next: (data) => { this.produits = data; this.loading = false; },
      error: () => { this.toast.error('Impossible de charger votre stock'); this.loading = false; }
    });
  }
}
