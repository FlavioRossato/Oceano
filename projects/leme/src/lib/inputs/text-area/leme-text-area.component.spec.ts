import { TestBed } from '@angular/core/testing';
import { LemeTextAreaComponent } from './leme-text-area.component';

describe('LemeTextAreaComponent (CVA)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LemeTextAreaComponent] }).compileComponents();
  });

  function create() {
    return TestBed.createComponent(LemeTextAreaComponent).componentInstance;
  }

  it('creates', () => {
    expect(create()).toBeTruthy();
  });

  it('writeValue reflects in value (null-safe)', () => {
    const c = create();
    c.writeValue('abc');
    expect(c.value).toBe('abc');
    c.writeValue(null as unknown as string);
    expect(c.value).toBe('');
  });

  it('registerOnChange fires on input', () => {
    const c = create();
    let received: string | undefined;
    c.registerOnChange((v: string) => (received = v));
    c.onInput({ target: { value: 'texto' } } as unknown as Event);
    expect(received).toBe('texto');
  });

  it('setDisabledState updates disabled', () => {
    const c = create();
    c.setDisabledState(true);
    expect(c.disabled).toBe(true);
  });
});
