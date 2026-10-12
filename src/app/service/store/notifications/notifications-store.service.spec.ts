import { TestBed } from '@angular/core/testing';

import { NotificationsStoreService } from './notifications-store.service';

describe('NotificationsStoreService', () => {
  let service: NotificationsStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationsStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
