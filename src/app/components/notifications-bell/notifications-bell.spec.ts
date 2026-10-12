import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';

import { NotificationsBell } from './notifications-bell';
import { NotificationsStoreService } from '../../service/store/notifications/notifications-store.service';
import { SupportMessagingStoreService } from '../../service/store/support/support-messaging-store.service';

describe('NotificationsBell', () => {
  let component: NotificationsBell;
  let fixture: ComponentFixture<NotificationsBell>;

  const storeMock = {
    notifications: signal([]).asReadonly(),
    unreadCount: signal(0).asReadonly(),
    hasMore: signal(false).asReadonly(),
    markAsRead: jasmine.createSpy('markAsRead'),
    markAllAsRead: jasmine.createSpy('markAllAsRead'),
    loadMore: jasmine.createSpy('loadMore'),
  };

  const supportStoreMock = {
    claim: jasmine.createSpy('claim').and.resolveTo(null),
    error: signal<string | null>(null).asReadonly(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsBell],
      providers: [
        provideRouter([]),
        { provide: NotificationsStoreService, useValue: storeMock },
        { provide: SupportMessagingStoreService, useValue: supportStoreMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsBell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
