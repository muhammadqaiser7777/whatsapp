import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusSenderComponent } from './status-sender.component';

describe('StatusSenderComponent', () => {
  let component: StatusSenderComponent;
  let fixture: ComponentFixture<StatusSenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusSenderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusSenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
