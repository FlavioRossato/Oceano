import { ControlValueAccessor } from '@angular/forms';

/**
 * Base de ControlValueAccessor para os inputs da lib — concentra o boilerplate
 * de `onChange`/`onTouched`, `registerOn*` e `setDisabledState`, antes duplicado
 * em 8 componentes. Cada componente implementa apenas `writeValue` e expõe
 * `disabled` como `@Input()`.
 *
 * Interno da lib — não exportar no public-api.
 */
export abstract class LemeValueAccessorBase<T> implements ControlValueAccessor {
  /** Implementado como `@Input() disabled` em cada componente. */
  abstract disabled: boolean;

  protected onChange: (value: T) => void = () => {};
  protected onTouched: () => void = () => {};

  abstract writeValue(value: T): void;

  registerOnChange(fn: (value: T) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
}
