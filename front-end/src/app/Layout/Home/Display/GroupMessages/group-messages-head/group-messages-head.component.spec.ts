import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupMessagesHeadComponent } from './group-messages-head.component';

describe('GroupMessagesHeadComponent', () => {
  let component: GroupMessagesHeadComponent;
  let fixture: ComponentFixture<GroupMessagesHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupMessagesHeadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupMessagesHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
