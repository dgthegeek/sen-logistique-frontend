import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpressionQrComponent } from './impression-qr.component';

describe('ImpressionQrComponent', () => {
  let component: ImpressionQrComponent;
  let fixture: ComponentFixture<ImpressionQrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImpressionQrComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImpressionQrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
