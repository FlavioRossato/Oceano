import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { LemeValueAccessorBase } from '../../shared/leme-value-accessor.base';

export type LemeSwitchOrientation = 'Stack' | 'Inline';
export type LemeSwitchOrder = 'Default' | 'Inverse';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-switch',
  standalone: true,
  imports: [],
  templateUrl: './leme-switch.component.html',
  styleUrl: './leme-switch.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => LemeSwitchComponent),
    multi: true
  }]
})
export class LemeSwitchComponent extends LemeValueAccessorBase<boolean> {
  @Input() active: boolean = false;
  @Input() disabled: boolean = false;
  @Input() label: string = '';
  @Input() orientation: LemeSwitchOrientation = 'Inline';
  @Input() order: LemeSwitchOrder = 'Default';

  @Output() activeChange = new EventEmitter<boolean>();


  toggle(): void {
    if (this.disabled) return;
    this.active = !this.active;
    this.activeChange.emit(this.active);
    this.onChange(this.active);
    this.onTouched();
  }

  writeValue(value: boolean): void { this.active = !!value; }
}
