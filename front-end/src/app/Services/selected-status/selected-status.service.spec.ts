import { TestBed } from '@angular/core/testing';

import { SelectedStatusService } from './selected-status.service';

describe('SelectedStatusService', () => {
  let service: SelectedStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
