import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { LemeValueAccessorBase } from '../../shared/leme-value-accessor.base';
import { nextLemeId } from '../../shared/leme-uid';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-text-area',
  standalone: true,
  imports: [],
  templateUrl: './leme-text-area.component.html',
  styleUrl: './leme-text-area.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => LemeTextAreaComponent),
    multi: true
  }]
})
export class LemeTextAreaComponent extends LemeValueAccessorBase<string> {
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() placeholder: string = '';
  @Input() rows: number = 4;
  @Input() message: string = '';
  @Input() errorMessage: string = '';
  @Input() disabled: boolean = false;
  @Input() error: boolean = false;

  @Output() valueChange = new EventEmitter<string>();

  /** Id único para associar <label for> ↔ <textarea> (a11y). */
  readonly fieldId = nextLemeId('leme-text-area');

  value: string = '';


  onInput(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.value = val;
    this.onChange(val);
    this.valueChange.emit(val);
  }

  onBlur(): void { this.onTouched(); }

  writeValue(value: string): void { this.value = value ?? ''; }
}
