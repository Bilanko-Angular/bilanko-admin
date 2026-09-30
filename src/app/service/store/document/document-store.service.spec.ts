import { TestBed } from '@angular/core/testing';

import { DocumentStoreService } from './document-store.service';

describe('DocumentStoreService', () => {
  let service: DocumentStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
