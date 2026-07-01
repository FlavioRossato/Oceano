import { ChangeDetectionStrategy, Component, ElementRef, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { LemeCalendarContentComponent } from '../calendar-content/leme-calendar-content.component';
import { LemeCalendarContentState, LemeCalendarContentRange } from '../calendar-content/leme-calendar-content.component';

export type LemeDatePickerView = 'Full' | 'Months' | 'Years';

interface CalendarDay {
  label: string;
  date: Date;
  state: LemeCalendarContentState;
  range: LemeCalendarContentRange;
}

const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const WEEK_DAYS   = ['D','S','T','Q','Q','S','S'];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-date-picker',
  standalone: true,
  imports: [LemeCalendarContentComponent],
  templateUrl: './leme-date-picker.component.html',
  styleUrl: './leme-date-picker.component.scss'
})
export class LemeDatePickerComponent implements OnInit {
  @Input() view: LemeDatePickerView = 'Full';
  @Input() mode: 'single' | 'range' = 'single';
  @Input() selectedDate: Date | null = null;
  @Input() selectedRange: [Date, Date] | null = null;

  @Output() dateSelect   = new EventEmitter<Date>();
  @Output() viewChange   = new EventEmitter<LemeDatePickerView>();
  @Output() navigate     = new EventEmitter<'prev' | 'next'>();

  currentDate: Date = new Date();
  weekDays = WEEK_DAYS;
  monthNames = MONTH_NAMES;

  /** Dia com foco de teclado (roving tabindex). Sempre dentro do mês visível. */
  focusedDate: Date | null = null;

  constructor(private el: ElementRef<HTMLElement>) {}

  get displayMonth(): string { return MONTH_NAMES[this.currentDate.getMonth()]; }
  get displayYear(): number  { return this.currentDate.getFullYear(); }

  get yearRange(): number[] {
    const base = Math.floor(this.displayYear / 10) * 10;
    return Array.from({ length: 10 }, (_, i) => base + i);
  }

  get calendarDays(): CalendarDay[] {
    const year  = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay   = new Date(year, month, 1);
    const lastDay    = new Date(year, month + 1, 0);
    const startWeekDay = firstDay.getDay();
    const days: CalendarDay[] = [];
    const today = new Date(); today.setHours(0,0,0,0);

    for (let i = startWeekDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ label: String(d.getDate()), date: d, state: 'LastNextMonth', range: 'None' });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d); date.setHours(0,0,0,0);
      let state: LemeCalendarContentState = 'Current';
      let range: LemeCalendarContentRange = 'None';

      if (date.getTime() === today.getTime()) state = 'Today';

      if (this.mode === 'single' && this.selectedDate) {
        const sel = new Date(this.selectedDate); sel.setHours(0,0,0,0);
        if (date.getTime() === sel.getTime()) state = 'Selected';
      }

      if (this.mode === 'range' && this.selectedRange) {
        const [s, e] = this.selectedRange.map(d => { const x = new Date(d); x.setHours(0,0,0,0); return x; });
        if (date.getTime() === s.getTime()) { state = 'Selected'; range = 'Start'; }
        else if (date.getTime() === e.getTime()) { state = 'Selected'; range = 'End'; }
        else if (date > s && date < e) { state = 'Selected'; range = 'Gap'; }
      }

      days.push({ label: String(d), date, state, range });
    }

    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      days.push({ label: String(d), date, state: 'LastNextMonth', range: 'None' });
    }

    return days;
  }

  get calendarWeeks(): CalendarDay[][] {
    const days = this.calendarDays;
    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
    return weeks;
  }

  ngOnInit(): void {
    this.focusedDate = this.initialFocusedDate();
  }

  // ─── Teclado (a11y) ──────────────────────────────────────────────────────

  private sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
  }

  private initialFocusedDate(): Date {
    const month = this.currentDate.getMonth();
    const year  = this.currentDate.getFullYear();
    if (this.selectedDate) {
      const sel = new Date(this.selectedDate);
      if (sel.getMonth() === month && sel.getFullYear() === year) return sel;
    }
    const today = new Date();
    if (today.getMonth() === month && today.getFullYear() === year) {
      today.setHours(0, 0, 0, 0);
      return today;
    }
    return new Date(year, month, 1);
  }

  /** Célula de dia atualmente focável (roving tabindex). */
  isFocused(date: Date): boolean {
    return this.focusedDate ? this.sameDay(date, this.focusedDate) : false;
  }

  /** Navegação por setas/Enter no grid de dias (view Full). */
  onGridKeydown(event: KeyboardEvent): void {
    if (this.view !== 'Full' || !this.focusedDate) return;
    const key = event.key;

    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.dateSelect.emit(this.focusedDate);
      return;
    }

    let delta = 0;
    switch (key) {
      case 'ArrowRight': delta = 1; break;
      case 'ArrowLeft':  delta = -1; break;
      case 'ArrowDown':  delta = 7; break;
      case 'ArrowUp':    delta = -7; break;
      default: return;
    }
    event.preventDefault();

    const next = new Date(this.focusedDate);
    next.setDate(next.getDate() + delta);
    next.setHours(0, 0, 0, 0);

    // Cruzou o mês visível → navega mantendo o foco no novo dia
    if (next.getMonth() !== this.currentDate.getMonth()
     || next.getFullYear() !== this.currentDate.getFullYear()) {
      this.currentDate = new Date(next.getFullYear(), next.getMonth(), 1);
    }
    this.focusedDate = next;
    this.focusActiveCell();
  }

  /** Move o foco do DOM para a célula focável após o re-render. */
  private focusActiveCell(): void {
    setTimeout(() => {
      const cell = this.el.nativeElement.querySelector(
        '.leme-date-picker__grid .leme-cal-content[tabindex="0"]'
      ) as HTMLElement | null;
      cell?.focus();
    });
  }

  /** Mantém o dia focável dentro do mês visível após navegar (preserva o dia). */
  private realignFocusedDate(): void {
    if (this.view !== 'Full') return;
    const day = this.focusedDate ? this.focusedDate.getDate() : 1;
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();
    this.focusedDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      Math.min(day, lastDay)
    );
  }

  prev(): void {
    if (this.view === 'Full') this.currentDate = new Date(this.displayYear, this.currentDate.getMonth() - 1, 1);
    else if (this.view === 'Months') this.currentDate = new Date(this.displayYear - 1, 0, 1);
    else this.currentDate = new Date(this.displayYear - 10, 0, 1);
    this.realignFocusedDate();
    this.navigate.emit('prev');
  }

  next(): void {
    if (this.view === 'Full') this.currentDate = new Date(this.displayYear, this.currentDate.getMonth() + 1, 1);
    else if (this.view === 'Months') this.currentDate = new Date(this.displayYear + 1, 0, 1);
    else this.currentDate = new Date(this.displayYear + 10, 0, 1);
    this.realignFocusedDate();
    this.navigate.emit('next');
  }

  switchView(v: LemeDatePickerView): void {
    this.view = v;
    this.viewChange.emit(v);
  }

  onDayClick(day: CalendarDay): void {
    if (day.state === 'Disabled' || day.state === 'LastNextMonth') return;
    this.dateSelect.emit(day.date);
  }

  onMonthClick(monthIndex: number): void {
    this.currentDate = new Date(this.displayYear, monthIndex, 1);
    this.view = 'Full';
    this.viewChange.emit('Full');
  }

  onYearClick(year: number): void {
    this.currentDate = new Date(year, this.currentDate.getMonth(), 1);
    this.view = 'Months';
    this.viewChange.emit('Months');
  }

  monthState(monthIndex: number): LemeCalendarContentState {
    if (!this.selectedDate) return 'Current';
    const sel = new Date(this.selectedDate);
    return sel.getFullYear() === this.displayYear && sel.getMonth() === monthIndex ? 'Selected' : 'Current';
  }

  yearState(year: number): LemeCalendarContentState {
    if (!this.selectedDate) return 'Current';
    return new Date(this.selectedDate).getFullYear() === year ? 'Selected' : 'Current';
  }
}
