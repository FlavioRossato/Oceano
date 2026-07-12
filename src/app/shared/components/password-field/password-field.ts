import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;

/** Campo de senha com ícone de cadeado e alternância de visibilidade, reaproveitado nas telas de retomada e recuperação de senha. */
@Component({
  selector: 'app-password-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './password-field.html',
  styleUrl: './password-field.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordFieldComponent),
      multi: true,
    },
  ],
})
export class PasswordFieldComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() required = false;
  @Input() placeholder = 'Digite sua senha';
  @Input() errorMessage = '';
  @Input() error = false;
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();

  readonly fieldId = `app-password-field-${++nextId}`;
  readonly showPassword = signal(false);

  value = '';

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  toggleVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
