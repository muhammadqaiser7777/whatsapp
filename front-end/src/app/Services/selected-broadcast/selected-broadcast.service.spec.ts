import { TestBed } from '@angular/core/testing';

import { SelectedBroadcastService } from './selected-broadcast.service';

describe('SelectedBroadcastService', () => {
  let service: SelectedBroadcastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedBroadcastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
