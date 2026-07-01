import { TestBed } from '@angular/core/testing';
import { LemeCheckboxComponent } from './leme-checkbox.component';

describe('LemeCheckboxComponent (CVA)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LemeCheckboxComponent] }).compileComponents();
  });

  function create() {
    return TestBed.createComponent(LemeCheckboxComponent).componentInstance;
  }

  it('creates', () => {
    expect(create()).toBeTruthy();
  });

  it('writeValue reflects in checked', () => {
    const c = create();
    c.writeValue(true);
    expect(c.checked).toBe(true);
  });

  it('registerOnChange fires on toggle', () => {
    const c = create();
    let received: boolean | undefined;
    c.registerOnChange((v: boolean) => (received = v));
    c.toggle();
    expect(received).toBe(true);
    expect(c.checked).toBe(true);
  });

  it('setDisabledState updates disabled and blocks toggle', () => {
    const c = create();
    c.setDisabledState(true);
    expect(c.disabled).toBe(true);
    c.toggle();
    expect(c.checked).toBe(false);
  });
});
