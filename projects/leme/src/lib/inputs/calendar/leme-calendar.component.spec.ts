import { TestBed } from '@angular/core/testing';
import { LemeCalendarComponent } from './leme-calendar.component';

describe('LemeCalendarComponent (CVA + teclado)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LemeCalendarComponent] }).compileComponents();
  });

  function create() {
    return TestBed.createComponent(LemeCalendarComponent).componentInstance;
  }

  it('creates', () => {
    expect(create()).toBeTruthy();
  });

  it('writeValue reflects in value (null-safe)', () => {
    const c = create();
    c.writeValue('01/01/2026');
    expect(c.value).toBe('01/01/2026');
    c.writeValue(null as unknown as string);
    expect(c.value).toBe('');
  });

  it('onDateSelect formata a data e dispara onChange', () => {
    const c = create();
    let received: string | undefined;
    c.registerOnChange((v: string) => (received = v));
    c.onDateSelect(new Date(2026, 0, 5)); // 05/01/2026
    expect(received).toBe('05/01/2026');
    expect(c.value).toBe('05/01/2026');
    expect(c.isOpen).toBe(false);
  });

  it('abre com Enter pelo teclado no box', () => {
    const c = create();
    c.onBoxKeydown({ key: 'Enter', preventDefault() {} } as unknown as KeyboardEvent);
    expect(c.isOpen).toBe(true);
  });

  it('setDisabledState bloqueia abertura', () => {
    const c = create();
    c.setDisabledState(true);
    c.togglePicker();
    expect(c.isOpen).toBe(false);
  });
});
