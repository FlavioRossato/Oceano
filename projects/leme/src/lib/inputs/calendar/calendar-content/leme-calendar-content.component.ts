import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';

export type LemeCalendarContentType  = 'Day' | 'Month' | 'Year';
export type LemeCalendarContentState = 'Current' | 'Hover' | 'Selected' | 'Today' | 'LastNextMonth' | 'Disabled';
export type LemeCalendarContentRange = 'None' | 'Start' | 'Gap' | 'End';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-calendar-content',
  standalone: true,
  imports: [],
  templateUrl: './leme-calendar-content.component.html',
  styleUrl: './leme-calendar-content.component.scss'
})
export class LemeCalendarContentComponent {
  @Input() type:  LemeCalendarContentType  = 'Day';
  @Input() state: LemeCalendarContentState = 'Current';
  @Input() range: LemeCalendarContentRange = 'None';
  @Input() label: string = '';
  /** Roving tabindex: só a célula ativa fica focável (tabindex 0). */
  @Input() focusable: boolean = false;

  @Output() contentClick = new EventEmitter<void>();

  get isDisabled(): boolean { return this.state === 'Disabled'; }
  get isSelected(): boolean { return this.state === 'Selected'; }
  get isToday(): boolean    { return this.state === 'Today'; }
  get isLastNext(): boolean { return this.state === 'LastNextMonth'; }
  get hasRange(): boolean   { return this.range !== 'None'; }
}
