import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Charges } from './charges';

describe('Charges', () => {
  let component: Charges;
  let fixture: ComponentFixture<Charges>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Charges]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Charges);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
