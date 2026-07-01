import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type LemeAvatarType  = 'Letter' | 'Photo' | 'Icon';
export type LemeAvatarColor = 'Gray' | 'Primary';
export type LemeAvatarSize  = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Big';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-avatar',
  standalone: true,
  imports: [],
  templateUrl: './leme-avatar.component.html',
  styleUrl: './leme-avatar.component.scss',
})
export class LemeAvatarComponent {
  @Input() type: LemeAvatarType  = 'Letter';
  @Input() color: LemeAvatarColor = 'Gray';
  @Input() size: LemeAvatarSize  = 'Tiny';

  /** Iniciais exibidas no tipo Letter */
  @Input() letter: string = 'WW';

  /** Nome do ícone Material Symbols (tipo Icon) */
  @Input() icon: string = 'person';

  /** URL da foto (tipo Photo) */
  @Input() photoSrc: string = '';

  /** Texto ao lado do avatar */
  @Input() label: string = '';

  /** Exibe o label ao lado */
  @Input() showLabel: boolean = false;
}
