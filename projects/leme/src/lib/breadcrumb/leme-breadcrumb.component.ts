import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface LemeBreadcrumbItem {
  label: string;
  route?: string | any[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './leme-breadcrumb.component.html',
  styleUrl: './leme-breadcrumb.component.scss',
})
export class LemeBreadcrumbComponent {
  @Input() items: LemeBreadcrumbItem[] = [];
  @Input() icon: string = '';
  @Input() maxVisible: number = 0;
  @Input() showBack: boolean = true;
  @Input() backLabel: string = 'Voltar';

  @Output() itemClick  = new EventEmitter<number>();
  @Output() backClick  = new EventEmitter<void>();

  get visibleItems(): (LemeBreadcrumbItem | null)[] {
    if (this.maxVisible < 1 || this.items.length <= this.maxVisible) {
      return this.items;
    }
    const keepLast = Math.max(this.maxVisible - 2, 1);
    return [this.items[0], null, ...this.items.slice(-keepLast)];
  }

  isLast(index: number): boolean {
    return index === this.visibleItems.length - 1;
  }

  get shouldShowBack(): boolean {
    return this.showBack && this.items.length > 1;
  }

  // Navega para o item anterior (penúltimo) se ele tiver rota.
  // Caso contrário, emite backClick para o componente pai tratar.
  get computedBackRoute(): string | any[] | undefined {
    if (this.items.length < 2) return undefined;
    return this.items[this.items.length - 2]?.route;
  }
}
