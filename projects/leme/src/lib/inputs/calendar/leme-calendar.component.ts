import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, forwardRef, HostListener, ElementRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { LemeValueAccessorBase } from '../../shared/leme-value-accessor.base';
import { LemeDatePickerComponent } from './date-picker/leme-date-picker.component';
import { nextLemeId } from '../../shared/leme-uid';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-calendar',
  standalone: true,
  imports: [LemeDatePickerComponent],
  templateUrl: './leme-calendar.component.html',
  styleUrl: './leme-calendar.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => LemeCalendarComponent),
    multi: true
  }]
})
export class LemeCalendarComponent extends LemeValueAccessorBase<string> {
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() placeholder: string = 'DD/MM/AAAA';
  @Input() message: string = '';
  @Input() errorMessage: string = '';
  @Input() disabled: boolean = false;
  @Input() error: boolean = false;
  @Input() mode: 'single' | 'range' = 'single';

  @Output() dateSelected = new EventEmitter<Date | [Date, Date]>();

  /** Id para associar <label for> ↔ box (a11y). */
  readonly fieldId = nextLemeId('leme-calendar');

  value: string = '';
  selectedDate: Date | null = null;
  isOpen: boolean = false;


  constructor(private elRef: ElementRef<HTMLElement>) { super(); }

  togglePicker(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    this.onTouched();
  }

  /** Abrir/selecionar pelo teclado a partir do box. */
  onBoxKeydown(event: KeyboardEvent): void {
    if (this.disabled) return;
    const key = event.key;
    if (key === 'Enter' || key === ' ' || key === 'ArrowDown') {
      event.preventDefault();
      if (!this.isOpen) { this.isOpen = true; this.onTouched(); }
    } else if (key === 'Escape' && this.isOpen) {
      event.preventDefault();
      this.closeAndFocusBox();
    }
  }

  private closeAndFocusBox(): void {
    this.isOpen = false;
    const box = this.elRef.nativeElement.querySelector('.leme-calendar__box') as HTMLElement | null;
    box?.focus();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.closeAndFocusBox();
  }

  onDateSelect(date: Date): void {
    this.selectedDate = date;
    this.value = this.formatDate(date);
    this.onChange(this.value);
    this.dateSelected.emit(date);
    this.isOpen = false;
  }

  private formatDate(d: Date): string {
    const dd   = String(d.getDate()).padStart(2, '0');
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.elRef.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
    }
  }

  writeValue(value: string): void { this.value = value ?? ''; }
}
