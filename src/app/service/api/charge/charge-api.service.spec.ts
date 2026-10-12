import { TestBed } from '@angular/core/testing';

import { ChargeApiService } from './charge-api.service';

describe('ChargeApiService', () => {
  let service: ChargeApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChargeApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
