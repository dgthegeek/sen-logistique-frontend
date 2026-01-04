import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreerLivraisonVendeurComponent } from './creer-livraison-vendeur.component';

describe('CreerLivraisonVendeurComponent', () => {
  let component: CreerLivraisonVendeurComponent;
  let fixture: ComponentFixture<CreerLivraisonVendeurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreerLivraisonVendeurComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreerLivraisonVendeurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
