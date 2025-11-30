import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivraisonsComponent } from './livraisons.component';

describe('LivraisonsComponent', () => {
  let component: LivraisonsComponent;
  let fixture: ComponentFixture<LivraisonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivraisonsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LivraisonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
