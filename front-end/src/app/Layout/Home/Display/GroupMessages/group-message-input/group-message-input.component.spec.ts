import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupMessageInputComponent } from './group-message-input.component';

describe('GroupMessageInputComponent', () => {
  let component: GroupMessageInputComponent;
  let fixture: ComponentFixture<GroupMessageInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupMessageInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupMessageInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
