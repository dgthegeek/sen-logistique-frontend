import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackingHomeComponent } from './tracking-home.component';

describe('TrackingHomeComponent', () => {
  let component: TrackingHomeComponent;
  let fixture: ComponentFixture<TrackingHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackingHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrackingHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
