import { TestBed } from '@angular/core/testing';
import { LemeRadioComponent } from './leme-radio.component';

describe('LemeRadioComponent (CVA)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LemeRadioComponent] }).compileComponents();
  });

  function create() {
    return TestBed.createComponent(LemeRadioComponent).componentInstance;
  }

  it('creates', () => {
    expect(create()).toBeTruthy();
  });

  it('writeValue marks checked when value matches', () => {
    const c = create();
    c.value = 'a';
    c.writeValue('a');
    expect(c.checked).toBe(true);
    c.writeValue('b');
    expect(c.checked).toBe(false);
  });

  it('registerOnChange emits the value on select', () => {
    const c = create();
    c.value = 'a';
    let received: unknown;
    c.registerOnChange((v: unknown) => (received = v));
    c.select();
    expect(received).toBe('a');
    expect(c.checked).toBe(true);
  });

  it('setDisabledState blocks select', () => {
    const c = create();
    c.value = 'a';
    c.setDisabledState(true);
    c.select();
    expect(c.checked).toBe(false);
  });
});
