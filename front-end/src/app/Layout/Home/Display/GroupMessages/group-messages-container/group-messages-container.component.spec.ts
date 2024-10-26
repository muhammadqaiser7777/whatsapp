import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupMessagesContainerComponent } from './group-messages-container.component';

describe('GroupMessagesContainerComponent', () => {
  let component: GroupMessagesContainerComponent;
  let fixture: ComponentFixture<GroupMessagesContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupMessagesContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupMessagesContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
