import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { LemeCheckboxComponent } from '../../checkbox/leme-checkbox.component';

export type LemeSelectItemType = 'Basic' | 'Checkbox' | 'Avatar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-select-item',
  standalone: true,
  imports: [LemeCheckboxComponent],
  templateUrl: './leme-select-item.component.html',
  styleUrl: './leme-select-item.component.scss'
})
export class LemeSelectItemComponent {
  @Input() type: LemeSelectItemType = 'Basic';
  @Input() label: string = '';
  @Input() selected: boolean = false;
  /** Destaque de opção "ativa" durante navegação por teclado (a11y). */
  @Input() active: boolean = false;
  @Input() avatarInitials: string = '';

  @Output() itemClick = new EventEmitter<void>();
}
