import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryConfirmComponent } from './delivery-confirm.component';

describe('DeliveryConfirmComponent', () => {
  let component: DeliveryConfirmComponent;
  let fixture: ComponentFixture<DeliveryConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryConfirmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeliveryConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
