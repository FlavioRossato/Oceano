import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type LemeMessageSeverity = 'Error' | 'Success' | 'Informative' | 'Warn';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-message',
  standalone: true,
  imports: [],
  templateUrl: './leme-message.component.html',
  styleUrl: './leme-message.component.scss',
})
export class LemeMessageComponent {
  @Input() severity: LemeMessageSeverity = 'Error';
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() showTitle: boolean = true;

  get iconName(): string {
    const map: Record<LemeMessageSeverity, string> = {
      Error:       'cancel',
      Success:     'check_circle',
      Informative: 'info',
      Warn:        'warning',
    };
    return map[this.severity];
  }
}
