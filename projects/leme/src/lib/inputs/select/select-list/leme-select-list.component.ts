import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { LemeSelectItemComponent, LemeSelectItemType } from '../select-item/leme-select-item.component';

export type LemeSelectListQty = 'Limited' | 'Unlimited';

export interface LemeSelectOption {
  label: string;
  value: string;
  avatarInitials?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-select-list',
  standalone: true,
  imports: [LemeSelectItemComponent],
  templateUrl: './leme-select-list.component.html',
  styleUrl: './leme-select-list.component.scss'
})
export class LemeSelectListComponent {
  @Input() items: LemeSelectOption[] = [];
  @Input() type: LemeSelectItemType = 'Basic';
  @Input() qtyOptions: LemeSelectListQty = 'Unlimited';
  @Input() selectedValues: string[] = [];
  /** Valor da opção em destaque por teclado (a11y). */
  @Input() activeValue: string | null = null;

  @Output() selectionChange = new EventEmitter<string[]>();

  isSelected(value: string): boolean {
    return this.selectedValues.includes(value);
  }

  onItemClick(value: string): void {
    let next: string[];
    if (this.type === 'Checkbox') {
      next = this.isSelected(value)
        ? this.selectedValues.filter(v => v !== value)
        : [...this.selectedValues, value];
    } else {
      next = [value];
    }
    this.selectionChange.emit(next);
  }
}
