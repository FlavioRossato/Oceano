import { TestBed } from '@angular/core/testing';
import { LemeTextFieldComponent } from './leme-text-field.component';

describe('LemeTextFieldComponent (CVA)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LemeTextFieldComponent] }).compileComponents();
  });

  function create() {
    return TestBed.createComponent(LemeTextFieldComponent).componentInstance;
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
    c.onInput({ target: { value: 'hello' } } as unknown as Event);
    expect(received).toBe('hello');
    expect(c.value).toBe('hello');
  });

  it('setDisabledState updates disabled', () => {
    const c = create();
    c.setDisabledState(true);
    expect(c.disabled).toBe(true);
  });

  it('exposes a unique fieldId for label association', () => {
    expect(create().fieldId).toMatch(/^leme-text-field-\d+$/);
  });

  it('mask="cpf" formats digits and reports the formatted maxLength', () => {
    const c = create();
    c.mask = 'cpf';
    let received: string | undefined;
    c.registerOnChange((v: string) => (received = v));
    c.onInput({ target: { value: '11122233344' } } as unknown as Event);
    expect(received).toBe('111.222.333-44');
    expect(c.value).toBe('111.222.333-44');
    expect(c.maxLength).toBe(14);
  });

  it('mask="cpf" ignores digits beyond the 11th', () => {
    const c = create();
    c.mask = 'cpf';
    c.onInput({ target: { value: '111222333445566' } } as unknown as Event);
    expect(c.value).toBe('111.222.333-44');
  });

  it('without mask, maxLength is null and input passes through untouched', () => {
    const c = create();
    expect(c.maxLength).toBeNull();
    c.onInput({ target: { value: '111222333445566' } } as unknown as Event);
    expect(c.value).toBe('111222333445566');
  });
});
