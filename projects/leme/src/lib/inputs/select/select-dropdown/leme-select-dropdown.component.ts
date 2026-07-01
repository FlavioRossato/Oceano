import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { LemeSelectListComponent, LemeSelectOption, LemeSelectListQty } from '../select-list/leme-select-list.component';
import { LemeSelectItemType } from '../select-item/leme-select-item.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-select-dropdown',
  standalone: true,
  imports: [LemeSelectListComponent],
  templateUrl: './leme-select-dropdown.component.html',
  styleUrl: './leme-select-dropdown.component.scss'
})
export class LemeSelectDropdownComponent {
  @Input() items: LemeSelectOption[] = [];
  @Input() type: LemeSelectItemType = 'Basic';
  @Input() showSearch: boolean = false;
  @Input() showCheckbox: boolean = false;
  @Input() selectedValues: string[] = [];
  /** Valor da opção em destaque por teclado (a11y). */
  @Input() activeValue: string | null = null;

  @Output() selectionChange = new EventEmitter<string[]>();

  searchTerm: string = '';

  get filteredItems(): LemeSelectOption[] {
    if (!this.searchTerm) return this.items;
    const term = this.searchTerm.toLowerCase();
    return this.items.filter(i => i.label.toLowerCase().includes(term));
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  get effectiveShowCheckbox(): boolean {
    return this.showSearch && this.showCheckbox;
  }
}
