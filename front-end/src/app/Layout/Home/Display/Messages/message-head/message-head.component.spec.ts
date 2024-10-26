import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageHeadComponent } from './message-head.component';

describe('MessageHeadComponent', () => {
  let component: MessageHeadComponent;
  let fixture: ComponentFixture<MessageHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageHeadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
