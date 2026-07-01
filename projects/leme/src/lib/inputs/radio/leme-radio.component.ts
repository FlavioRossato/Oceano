import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { LemeValueAccessorBase } from '../../shared/leme-value-accessor.base';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-radio',
  standalone: true,
  imports: [],
  templateUrl: './leme-radio.component.html',
  styleUrl: './leme-radio.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => LemeRadioComponent),
    multi: true
  }]
})
export class LemeRadioComponent extends LemeValueAccessorBase<unknown> {
  @Input() checked: boolean = false;
  @Input() disabled: boolean = false;
  @Input() label: string = '';
  @Input() value: any = null;

  @Output() checkedChange = new EventEmitter<any>();


  select(): void {
    if (this.disabled || this.checked) return;
    this.checked = true;
    this.checkedChange.emit(this.value);
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(value: any): void { this.checked = value === this.value; }
}
