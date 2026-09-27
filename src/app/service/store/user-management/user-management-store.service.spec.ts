import { TestBed } from '@angular/core/testing';

import { UserManagementStoreService } from './user-management-store.service';

describe('UserManagementStoreService', () => {
  let service: UserManagementStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserManagementStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
