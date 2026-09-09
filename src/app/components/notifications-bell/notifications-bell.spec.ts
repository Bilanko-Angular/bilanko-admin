import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsBell } from './notifications-bell';

describe('NotificationsBell', () => {
  let component: NotificationsBell;
  let fixture: ComponentFixture<NotificationsBell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsBell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsBell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
