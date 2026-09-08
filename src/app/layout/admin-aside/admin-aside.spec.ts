import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAside } from './admin-aside';

describe('AdminAside', () => {
  let component: AdminAside;
  let fixture: ComponentFixture<AdminAside>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAside]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAside);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
