import { TestBed } from '@angular/core/testing';

import { UserManagentApiService } from './user-managent-api.service';

describe('UserManagentApiService', () => {
  let service: UserManagentApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserManagentApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
