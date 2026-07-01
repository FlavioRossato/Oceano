import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  forwardRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { LemeValueAccessorBase } from '../../shared/leme-value-accessor.base';
import { LemeSelectDropdownComponent } from './select-dropdown/leme-select-dropdown.component';
import { LemeSelectOption } from './select-list/leme-select-list.component';
import { LemeSelectItemType } from './select-item/leme-select-item.component';
import { nextLemeId } from '../../shared/leme-uid';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-select',
  standalone: true,
  imports: [LemeSelectDropdownComponent],
  templateUrl: './leme-select.component.html',
  styleUrl: './leme-select.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => LemeSelectComponent),
    multi: true
  }]
})
export class LemeSelectComponent extends LemeValueAccessorBase<string> {
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() placeholder: string = '';
  @Input() message: string = '';
  @Input() errorMessage: string = '';
  @Input() disabled: boolean = false;
  @Input() error: boolean = false;

  /**
   * Modo embutido: quando `items` é informado, o próprio select renderiza o
   * dropdown + teclado completo e resolve o label exibido a partir do `value`.
   * Quando omitido, mantém o comportamento legado (só emite `opened`; a tela
   * compõe o overlay/painel manualmente — migração no Sprint 3/T3.4).
   */
  @Input() items?: LemeSelectOption[];
  @Input() itemType: LemeSelectItemType = 'Basic';
  @Input() showSearch: boolean = false;

  @Output() opened = new EventEmitter<void>();
  @Output() cleared = new EventEmitter<void>();
  @Output() valueChange = new EventEmitter<string>();

  /** Ids para associar label ↔ box e box ↔ listbox (a11y). */
  readonly fieldId = nextLemeId('leme-select');

  value: string = '';
  isOpen: boolean = false;
  /** Valor da opção em destaque durante navegação por teclado. */
  activeValue: string | null = null;


  constructor(private host: ElementRef<HTMLElement>) { super(); }

  /** True quando opera em modo embutido (items informado). */
  get embedded(): boolean { return this.items !== undefined; }

  get hasValue(): boolean { return !!this.value; }

  get selectedValues(): string[] { return this.value ? [this.value] : []; }

  /** Texto exibido no box: label resolvido (embutido) ou value cru (legado). */
  get displayLabel(): string {
    if (this.embedded) {
      const opt = this.items!.find(i => i.value === this.value);
      return opt ? opt.label : '';
    }
    return this.value;
  }

  // ─── Abrir / fechar ──────────────────────────────────────────────────────

  onBoxClick(): void {
    if (this.disabled) return;
    if (this.embedded && this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (this.disabled) return;
    this.onTouched();
    this.opened.emit();
    if (this.embedded) {
      this.isOpen = true;
      this.activeValue = this.value || (this.items!.length ? this.items![0].value : null);
    }
  }

  close(): void {
    this.isOpen = false;
    this.activeValue = null;
  }

  // ─── Teclado ───────────────────────────────────────────────────────────────

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled) return;
    // Só o próprio box reage; eventos vindos do botão "limpar" ou do painel não.
    if (!(event.target as HTMLElement).classList?.contains('leme-select__box')) return;

    const key = event.key;

    if (!this.embedded) {
      if (key === 'Enter' || key === ' ') { event.preventDefault(); this.open(); }
      return;
    }

    if (!this.isOpen) {
      if (key === 'Enter' || key === ' ' || key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
        this.open();
      }
      return;
    }

    const items = this.items!;
    const current = items.findIndex(i => i.value === this.activeValue);

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeValue = items[Math.min(current + 1, items.length - 1)]?.value ?? this.activeValue;
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeValue = items[Math.max(current - 1, 0)]?.value ?? this.activeValue;
        break;
      case 'Home':
        event.preventDefault();
        this.activeValue = items.length ? items[0].value : null;
        break;
      case 'End':
        event.preventDefault();
        this.activeValue = items.length ? items[items.length - 1].value : null;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.activeValue !== null) this.selectValue(this.activeValue);
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  // ─── Seleção ─────────────────────────────────────────────────────────────

  /** Recebe a seleção do dropdown embutido (single-select). */
  onDropdownSelection(values: string[]): void {
    this.selectValue(values.length ? values[values.length - 1] : '');
  }

  private selectValue(v: string): void {
    this.value = v;
    this.onChange(v);
    this.valueChange.emit(v);
    this.close();
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.value = '';
    this.onChange('');
    this.valueChange.emit('');
    this.cleared.emit();
  }

  // ─── Fechar ao clicar fora (modo embutido) ───────────────────────────────

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen) return;
    if (!this.host.nativeElement.contains(event.target as Node)) this.close();
  }

  // ─── ControlValueAccessor ────────────────────────────────────────────────

  writeValue(value: string): void { this.value = value ?? ''; }
}
