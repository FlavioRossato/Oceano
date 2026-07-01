import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

// Nomenclatura preservada exatamente como no Figma (Navega Components v1, node 207:124)
export type LemeButtonVariant   = 'Filled' | 'Outlined' | 'Transparent';
export type LemeButtonHierarchy = 'Primary' | 'Negative';
export type LemeButtonType      = 'Common' | 'Icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-button',
  standalone: true,
  imports: [],
  templateUrl: './leme-button.component.html',
  styleUrl: './leme-button.component.scss'
})
export class LemeButtonComponent {
  // Variant — mapeia "Button Filled" | "Button Outlined" | "Button Transparent" do Figma
  @Input() variant: LemeButtonVariant = 'Filled';

  // Hierarchy — "Primary" | "Negative" do Figma
  @Input() hierarchy: LemeButtonHierarchy = 'Primary';

  // Type — "Common" (texto + ícones) | "Icon" (apenas ícone 40×40) do Figma
  @Input() type: LemeButtonType = 'Common';

  // Label do botão (Type=Common)
  @Input() label: string = 'Button';

  // Nome do ícone Google Material Icons para iconLeft e iconRight
  @Input() iconLeft: string = '';
  @Input() iconRight: string = '';
  @Input() showIconLeft: boolean = false;
  @Input() showIconRight: boolean = false;

  // Badge (bolinha numérica sobreposta no canto superior direito)
  @Input() showBadge: boolean = false;
  @Input() badgeCount: number = 1;

  // State=Disable do Figma → prop nativa Angular
  @Input() disabled: boolean = false;

  // State=Spinner do Figma → mostra spinner e desabilita interação
  @Input() loading: boolean = false;
}
