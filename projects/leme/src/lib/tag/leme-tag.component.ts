import { ChangeDetectionStrategy, Component, Input, HostBinding } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-tag',
  standalone: true,
  imports: [],
  templateUrl: './leme-tag.component.html',
  styleUrl: './leme-tag.component.scss',
})
export class LemeTagComponent {
  /** Figma: Default | Primary | Success | Informative | Warning | Danger | Disable
   *  Aliases: pending | waiting | confirmed | transmitting | delivered | error
   *           critical | in-progress | closed | not-started */
  @Input() severity: string = 'Default';

  /** Texto exibido dentro da tag */
  @Input() label: string = '';

  /** Nome do ícone Material Symbols (opcional) */
  @Input() icon: string = '';

  /** Tamanho da tag */
  @Input() size: 'sm' | 'lg' = 'sm';

  @HostBinding('class')
  get hostClass(): string {
    const cls = ['leme-tag', `leme-tag--${this.severity}`];
    if (this.size === 'lg') cls.push('leme-tag--lg');
    return cls.join(' ');
  }
}
