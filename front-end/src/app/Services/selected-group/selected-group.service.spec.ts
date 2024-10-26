import { TestBed } from '@angular/core/testing';

import { SelectedGroupService } from './selected-group.service';

describe('SelectedGroupService', () => {
  let service: SelectedGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
