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

  it('mask="telefone" formats digits and reports the formatted maxLength', () => {
    const c = create();
    c.mask = 'telefone';
    let received: string | undefined;
    c.registerOnChange((v: string) => (received = v));
    c.onInput({ target: { value: '11965878956' } } as unknown as Event);
    expect(received).toBe('(11) 96587-8956');
    expect(c.value).toBe('(11) 96587-8956');
    expect(c.maxLength).toBe(15);
  });

  it('mask="telefone" formats an 8-digit (landline) number without the extra digit', () => {
    const c = create();
    c.mask = 'telefone';
    c.onInput({ target: { value: '1132654321' } } as unknown as Event);
    expect(c.value).toBe('(11) 3265-4321');
  });

  it('mask="data" formats digits as dd/mm/aaaa and reports the formatted maxLength', () => {
    const c = create();
    c.mask = 'data';
    let received: string | undefined;
    c.registerOnChange((v: string) => (received = v));
    c.onInput({ target: { value: '20121989' } } as unknown as Event);
    expect(received).toBe('20/12/1989');
    expect(c.value).toBe('20/12/1989');
    expect(c.maxLength).toBe(10);
  });

  it('mask="data" ignores digits beyond the 8th', () => {
    const c = create();
    c.mask = 'data';
    c.onInput({ target: { value: '2012198999' } } as unknown as Event);
    expect(c.value).toBe('20/12/1989');
  });

  it('without mask, maxLength is null and input passes through untouched', () => {
    const c = create();
    expect(c.maxLength).toBeNull();
    c.onInput({ target: { value: '111222333445566' } } as unknown as Event);
    expect(c.value).toBe('111222333445566');
  });
});
