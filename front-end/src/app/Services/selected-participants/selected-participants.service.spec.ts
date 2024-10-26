import { TestBed } from '@angular/core/testing';

import { SelectedParticipantsService } from './selected-participants.service';

describe('SelectedParticipantsService', () => {
  let service: SelectedParticipantsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedParticipantsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
