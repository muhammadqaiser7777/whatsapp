import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcastInputComponent } from './broadcast-input.component';

describe('BroadcastInputComponent', () => {
  let component: BroadcastInputComponent;
  let fixture: ComponentFixture<BroadcastInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BroadcastInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BroadcastInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
