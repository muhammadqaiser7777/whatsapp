import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcastHeadComponent } from './broadcast-head.component';

describe('BroadcastHeadComponent', () => {
  let component: BroadcastHeadComponent;
  let fixture: ComponentFixture<BroadcastHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BroadcastHeadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BroadcastHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
