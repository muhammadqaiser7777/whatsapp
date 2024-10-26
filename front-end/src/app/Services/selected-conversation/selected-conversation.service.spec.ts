import { TestBed } from '@angular/core/testing';

import { SelectedConversationService } from './selected-conversation.service';

describe('SelectedConversationService', () => {
  let service: SelectedConversationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedConversationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
