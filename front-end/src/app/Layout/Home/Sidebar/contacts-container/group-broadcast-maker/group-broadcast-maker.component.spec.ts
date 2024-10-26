import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupBroadcastMakerComponent } from './group-broadcast-maker.component';

describe('GroupBroadcastMakerComponent', () => {
  let component: GroupBroadcastMakerComponent;
  let fixture: ComponentFixture<GroupBroadcastMakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupBroadcastMakerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupBroadcastMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
