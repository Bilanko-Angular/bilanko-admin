import { TestBed } from '@angular/core/testing';

import { ChargeStoreService } from './charge-store.service';

describe('ChargeStoreService', () => {
  let service: ChargeStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChargeStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
