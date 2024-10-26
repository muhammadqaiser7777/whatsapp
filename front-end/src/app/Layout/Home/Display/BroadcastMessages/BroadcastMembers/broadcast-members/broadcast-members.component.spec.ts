import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcastMembersComponent } from './broadcast-members.component';

describe('BroadcastMembersComponent', () => {
  let component: BroadcastMembersComponent;
  let fixture: ComponentFixture<BroadcastMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BroadcastMembersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BroadcastMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
