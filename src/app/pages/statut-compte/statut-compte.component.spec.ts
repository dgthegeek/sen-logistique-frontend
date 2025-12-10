import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatutCompteComponent } from './statut-compte.component';

describe('StatutCompteComponent', () => {
  let component: StatutCompteComponent;
  let fixture: ComponentFixture<StatutCompteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatutCompteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StatutCompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
