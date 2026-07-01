import { TestBed } from '@angular/core/testing';
import { LemeSelectComponent } from './leme-select.component';
import { LemeSelectOption } from './select-list/leme-select-list.component';

const OPTIONS: LemeSelectOption[] = [
  { label: 'Ana', value: 'a' },
  { label: 'Beto', value: 'b' },
  { label: 'Caio', value: 'c' },
];

describe('LemeSelectComponent (CVA + teclado)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LemeSelectComponent] }).compileComponents();
  });

  function create() {
    return TestBed.createComponent(LemeSelectComponent).componentInstance;
  }

  it('creates', () => {
    expect(create()).toBeTruthy();
  });

  it('writeValue reflects in value (null-safe)', () => {
    const c = create();
    c.writeValue('a');
    expect(c.value).toBe('a');
    c.writeValue(null as unknown as string);
    expect(c.value).toBe('');
  });

  it('setDisabledState updates disabled', () => {
    const c = create();
    c.setDisabledState(true);
    expect(c.disabled).toBe(true);
  });

  it('modo embutido: resolve o label a partir do value', () => {
    const c = create();
    c.items = OPTIONS;
    c.writeValue('b');
    expect(c.embedded).toBe(true);
    expect(c.displayLabel).toBe('Beto');
  });

  it('modo embutido: seleção do dropdown dispara onChange e fecha', () => {
    const c = create();
    c.items = OPTIONS;
    let received: string | undefined;
    c.registerOnChange((v: string) => (received = v));
    c.open();
    expect(c.isOpen).toBe(true);
    c.onDropdownSelection(['c']);
    expect(received).toBe('c');
    expect(c.value).toBe('c');
    expect(c.isOpen).toBe(false);
  });

  it('teclado: ArrowDown move a opção ativa e Enter seleciona', () => {
    const c = create();
    c.items = OPTIONS;
    let received: string | undefined;
    c.registerOnChange((v: string) => (received = v));
    const box = { classList: { contains: () => true } } as unknown as HTMLElement;
    const ev = (key: string) =>
      ({ key, target: box, preventDefault() {} }) as unknown as KeyboardEvent;

    c.onKeydown(ev('ArrowDown')); // abre
    expect(c.isOpen).toBe(true);
    c.onKeydown(ev('ArrowDown')); // a -> b
    expect(c.activeValue).toBe('b');
    c.onKeydown(ev('Enter'));
    expect(received).toBe('b');
  });

  it('teclado: Escape fecha', () => {
    const c = create();
    c.items = OPTIONS;
    const box = { classList: { contains: () => true } } as unknown as HTMLElement;
    c.open();
    c.onKeydown({ key: 'Escape', target: box, preventDefault() {} } as unknown as KeyboardEvent);
    expect(c.isOpen).toBe(false);
  });
});
