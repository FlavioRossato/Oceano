import { TestBed } from '@angular/core/testing';
import { LemeSearchComponent } from './leme-search.component';

describe('LemeSearchComponent (CVA)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LemeSearchComponent] }).compileComponents();
  });

  function create() {
    return TestBed.createComponent(LemeSearchComponent).componentInstance;
  }

  it('creates', () => {
    expect(create()).toBeTruthy();
  });

  it('writeValue reflects in value (null-safe)', () => {
    const c = create();
    c.writeValue('q');
    expect(c.value).toBe('q');
    c.writeValue(null as unknown as string);
    expect(c.value).toBe('');
  });

  it('registerOnChange fires on input', () => {
    const c = create();
    let received: string | undefined;
    c.registerOnChange((v: string) => (received = v));
    c.onInput({ target: { value: 'busca' } } as unknown as Event);
    expect(received).toBe('busca');
  });

  it('setDisabledState updates disabled', () => {
    const c = create();
    c.setDisabledState(true);
    expect(c.disabled).toBe(true);
  });
});
