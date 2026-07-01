import { TestBed } from '@angular/core/testing';
import { LemeSwitchComponent } from './leme-switch.component';

describe('LemeSwitchComponent (CVA)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LemeSwitchComponent] }).compileComponents();
  });

  function create() {
    return TestBed.createComponent(LemeSwitchComponent).componentInstance;
  }

  it('creates', () => {
    expect(create()).toBeTruthy();
  });

  it('writeValue reflects in active', () => {
    const c = create();
    c.writeValue(true);
    expect(c.active).toBe(true);
  });

  it('registerOnChange fires on toggle', () => {
    const c = create();
    let received: boolean | undefined;
    c.registerOnChange((v: boolean) => (received = v));
    c.toggle();
    expect(received).toBe(true);
    expect(c.active).toBe(true);
  });

  it('setDisabledState updates disabled and blocks toggle', () => {
    const c = create();
    c.setDisabledState(true);
    expect(c.disabled).toBe(true);
    c.toggle();
    expect(c.active).toBe(false);
  });
});
