import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';

import { Messaging } from './messaging';
import { SupportMessagingStoreService } from '../../service/store/support/support-messaging-store.service';

describe('Messaging', () => {
  let component: Messaging;
  let fixture: ComponentFixture<Messaging>;

  const storeMock = {
    conversations: signal([]).asReadonly(),
    isLoading: signal(false).asReadonly(),
    error: signal<string | null>(null).asReadonly(),
    loadPage: jasmine.createSpy('loadPage').and.resolveTo(undefined),
    loadConversation: jasmine.createSpy('loadConversation').and.resolveTo(null),
    loadMessages: jasmine.createSpy('loadMessages').and.resolveTo(undefined),
    sendMessage: jasmine.createSpy('sendMessage').and.resolveTo(true),
    transfer: jasmine.createSpy('transfer').and.resolveTo(true),
    markAsRead: jasmine.createSpy('markAsRead'),
    messagesDe: () => signal([]).asReadonly(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Messaging],
      providers: [
        provideRouter([]),
        { provide: SupportMessagingStoreService, useValue: storeMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Messaging);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
