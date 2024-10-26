import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusSidebarComponent } from './status-sidebar.component';

describe('StatusSidebarComponent', () => {
  let component: StatusSidebarComponent;
  let fixture: ComponentFixture<StatusSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
