import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { LemeValueAccessorBase } from '../../shared/leme-value-accessor.base';
import { nextLemeId } from '../../shared/leme-uid';
import { LEME_TEXT_FIELD_MASKS, LemeTextFieldMask } from '../../shared/leme-text-field-masks';

export type { LemeTextFieldMask };

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-text-field',
  standalone: true,
  imports: [],
  templateUrl: './leme-text-field.component.html',
  styleUrl: './leme-text-field.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => LemeTextFieldComponent),
    multi: true
  }]
})
export class LemeTextFieldComponent extends LemeValueAccessorBase<string> {
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() placeholder: string = '';
  @Input() message: string = '';
  @Input() errorMessage: string = '';
  @Input() disabled: boolean = false;
  @Input() error: boolean = false;
  /** Formata o valor conforme o usuário digita e limita o tamanho do input nativo. */
  @Input() mask: LemeTextFieldMask | null = null;

  @Output() valueChange = new EventEmitter<string>();

  /** Id único para associar <label for> ↔ <input> (a11y). */
  readonly fieldId = nextLemeId('leme-text-field');

  value: string = '';

  get maxLength(): number | null {
    return this.mask ? LEME_TEXT_FIELD_MASKS[this.mask].maxLength : null;
  }

  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const val = this.mask ? LEME_TEXT_FIELD_MASKS[this.mask].format(raw) : raw;
    this.value = val;
    this.onChange(val);
    this.valueChange.emit(val);
  }

  onBlur(): void { this.onTouched(); }

  writeValue(value: string): void { this.value = value ?? ''; }
}
