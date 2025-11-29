import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreerLivraisonComponent } from './creer-livraison.component';

describe('CreerLivraisonComponent', () => {
  let component: CreerLivraisonComponent;
  let fixture: ComponentFixture<CreerLivraisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreerLivraisonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreerLivraisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
