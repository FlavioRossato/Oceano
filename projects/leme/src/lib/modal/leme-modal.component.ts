import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';

// Posicionamento do backdrop: 'fixed' cobre a viewport (modais de tela cheia);
// 'absolute' fica contido no ancestral posicionado (ex.: overlay de export dentro do painel).
export type LemeModalPositioning = 'fixed' | 'absolute';

// Alinhamento vertical da caixa: 'center' (padrão) ou 'start' (ancorado ao topo).
export type LemeModalAlign = 'center' | 'start';

/**
 * leme-modal — diálogo acessível "headless".
 *
 * Provê apenas o comportamento (role/aria, Escape, clique no backdrop, focus-trap e
 * devolução de foco) + o backdrop. O conteúdo (cabeçalho/corpo/rodapé e a própria
 * caixa visual) é projetado via <ng-content>, preservando o markup/estilo do consumidor.
 *
 * O componente é montado/desmontado pelo `@if` do consumidor: abrir = montar (foca o
 * primeiro focável e guarda o foco anterior); fechar = desmontar (devolve o foco).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-modal',
  standalone: true,
  imports: [],
  templateUrl: './leme-modal.component.html',
  styleUrl: './leme-modal.component.scss',
})
export class LemeModalComponent implements AfterViewInit, OnDestroy {
  // Rótulo acessível do diálogo. Usar aria-labelledby quando há um título com id no conteúdo.
  @Input() ariaLabel = '';
  @Input() ariaLabelledby = '';

  // Clique no backdrop fecha o modal (padrão dos modais atuais).
  @Input() closeOnBackdrop = true;

  // 'fixed' (viewport) ou 'absolute' (contido no ancestral posicionado).
  @Input() positioning: LemeModalPositioning = 'fixed';

  // Alinhamento vertical da caixa no backdrop.
  @Input() align: LemeModalAlign = 'center';

  // Deslocamento do topo quando align='start' (ex.: '80px'). Vazio = sem deslocamento.
  @Input() startOffset = '';

  // z-index do backdrop.
  @Input() zIndex: number | string = 1000;

  @Output() closed = new EventEmitter<void>();

  @ViewChild('dialog', { static: false }) dialogRef?: ElementRef<HTMLElement>;
  @ViewChild('backdrop', { static: false }) backdropRef?: ElementRef<HTMLElement>;

  private previouslyFocused: HTMLElement | null = null;

  private static readonly FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
    'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  ngAfterViewInit(): void {
    this.previouslyFocused = document.activeElement as HTMLElement | null;
    // setTimeout: garante que o conteúdo projetado já está no DOM antes de focar.
    setTimeout(() => this.focusFirst(), 0);
  }

  ngOnDestroy(): void {
    this.previouslyFocused?.focus?.();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }

  // Clique no backdrop fecha. Tratado no host (não há (click) no template) para não
  // disparar a regra de a11y click-events-have-key-events na lib — o equivalente de
  // teclado é o Escape (acima). Clique na caixa não fecha (target ≠ backdrop).
  @HostListener('click', ['$event'])
  onHostClick(event: MouseEvent): void {
    if (this.closeOnBackdrop && event.target === this.backdropRef?.nativeElement) {
      this.closed.emit();
    }
  }

  // Focus-trap: Tab/Shift+Tab circulam entre o primeiro e o último focável do diálogo.
  @HostListener('keydown.tab', ['$event'])
  @HostListener('keydown.shift.tab', ['$event'])
  onTab(event: Event): void {
    const e = event as KeyboardEvent;
    const focusables = this.getFocusable();
    if (focusables.length === 0) {
      e.preventDefault();
      this.dialogRef?.nativeElement.focus();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  private getFocusable(): HTMLElement[] {
    const dialog = this.dialogRef?.nativeElement;
    if (!dialog) return [];
    return Array.from(
      dialog.querySelectorAll<HTMLElement>(LemeModalComponent.FOCUSABLE),
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
  }

  private focusFirst(): void {
    const focusables = this.getFocusable();
    (focusables[0] ?? this.dialogRef?.nativeElement)?.focus();
  }
}
