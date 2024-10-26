import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcastMemberComponent } from './broadcast-member.component';

describe('BroadcastMemberComponent', () => {
  let component: BroadcastMemberComponent;
  let fixture: ComponentFixture<BroadcastMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BroadcastMemberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BroadcastMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
