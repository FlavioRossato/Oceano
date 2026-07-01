import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { LemeValueAccessorBase } from '../../shared/leme-value-accessor.base';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-checkbox',
  standalone: true,
  imports: [],
  templateUrl: './leme-checkbox.component.html',
  styleUrl: './leme-checkbox.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => LemeCheckboxComponent),
    multi: true
  }]
})
export class LemeCheckboxComponent extends LemeValueAccessorBase<boolean> {
  @Input() checked: boolean = false;
  @Input() disabled: boolean = false;
  @Input() label: string = '';
  @Input() showLabel: boolean = true;

  @Output() checkedChange = new EventEmitter<boolean>();


  toggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
    this.onChange(this.checked);
    this.onTouched();
  }

  writeValue(value: boolean): void { this.checked = !!value; }
}
