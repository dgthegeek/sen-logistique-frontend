import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionVendeursComponent } from './gestion-vendeurs.component';

describe('GestionVendeursComponent', () => {
  let component: GestionVendeursComponent;
  let fixture: ComponentFixture<GestionVendeursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionVendeursComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionVendeursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
