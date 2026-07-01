import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { LemeValueAccessorBase } from '../../shared/leme-value-accessor.base';
import { nextLemeId } from '../../shared/leme-uid';

export type LemeSearchType = 'Basic' | 'General';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-search',
  standalone: true,
  imports: [],
  templateUrl: './leme-search.component.html',
  styleUrl: './leme-search.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => LemeSearchComponent),
    multi: true
  }]
})
export class LemeSearchComponent extends LemeValueAccessorBase<string> {
  @Input() type: LemeSearchType = 'Basic';
  @Input() label: string = '';
  @Input() placeholder: string = 'Buscar';
  @Input() showFilter: boolean = false;
  @Input() errorMessage: string = '';
  @Input() disabled: boolean = false;
  @Input() error: boolean = false;
  @Input() fullWidth: boolean = false;

  @Output() valueChange = new EventEmitter<string>();
  @Output() filterClick = new EventEmitter<void>();
  @Output() focused = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();

  /** Id único para associar <label for> ↔ <input> (a11y). */
  readonly fieldId = nextLemeId('leme-search');

  value: string = '';


  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
    this.valueChange.emit(val);
  }

  onFocus(): void { this.focused.emit(); }

  onBlur(): void {
    this.onTouched();
    this.blurred.emit();
  }

  writeValue(value: string): void { this.value = value ?? ''; }
}
