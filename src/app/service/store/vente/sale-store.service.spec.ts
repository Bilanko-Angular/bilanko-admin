import { TestBed } from '@angular/core/testing';

import { SaleStoreService } from './sale-store.service';

describe('SaleStoreService', () => {
  let service: SaleStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaleStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
