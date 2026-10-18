import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionResponsePopup } from './action-response-popup';

describe('ActionResponsePopup', () => {
  let component: ActionResponsePopup;
  let fixture: ComponentFixture<ActionResponsePopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionResponsePopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionResponsePopup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
