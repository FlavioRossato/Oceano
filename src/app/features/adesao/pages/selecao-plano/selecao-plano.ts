import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LemeButtonComponent, LemeCheckboxComponent, LemeMessageComponent, LemeModalComponent, LemeRadioComponent } from 'leme';
import { Plano, PLANOS_MOCK } from '../../data/planos-mock.data';
import { AdesaoDadosService } from '../../services/adesao-dados.service';
import { AdesaoService } from '../../services/adesao.service';

@Component({
  selector: 'app-selecao-plano',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LemeButtonComponent, LemeCheckboxComponent, LemeMessageComponent, LemeModalComponent, LemeRadioComponent],
  templateUrl: './selecao-plano.html',
  styleUrl: './selecao-plano.scss',
})
export class SelecaoPlano implements OnInit, OnDestroy {
  private readonly dados = inject(AdesaoDadosService);
  protected readonly adesao = inject(AdesaoService);
  private readonly router = inject(Router);

  readonly planos = PLANOS_MOCK;

  readonly selecionado = signal<Plano | null>(null);
  /** Só usado quando há apenas 1 plano disponível — exige confirmação explícita (RN04). */
  readonly confirmado = signal(false);

  readonly mostrarConfirmacaoTroca = signal(false);
  private readonly planoPendente = signal<Plano | null>(null);

  readonly podeContinuar = computed(() => {
    if (this.planos.length === 0) return false;
    if (this.planos.length === 1) return this.confirmado();
    return this.selecionado() !== null;
  });

  constructor() {
    effect(() => this.adesao.setCanContinue(this.podeContinuar()), { allowSignalWrites: true });
  }

  ngOnInit(): void {
    const atual = this.dados.planoSelecionado();
    if (atual) {
      this.selecionado.set(atual);
      this.confirmado.set(true);
    } else if (this.planos.length === 1) {
      this.selecionado.set(this.planos[0]);
    }

    this.adesao.setNextOverride(() => this.confirmarSelecao());
  }

  ngOnDestroy(): void {
    this.adesao.setNextOverride(null);
    this.adesao.setCanContinue(true);
  }

  onConfirmadoChange(value: boolean): void {
    this.confirmado.set(value);
  }

  /** RN08: trocar para um plano de tipo diferente descarta dados exclusivos do plano anterior — exige confirmação. */
  selecionarPlano(plano: Plano): void {
    if (this.selecionado()?.id === plano.id) return;

    const anterior = this.dados.planoSelecionado();
    if (anterior && anterior.tipo !== plano.tipo) {
      this.planoPendente.set(plano);
      this.mostrarConfirmacaoTroca.set(true);
      return;
    }

    this.selecionado.set(plano);
  }

  confirmarTroca(): void {
    const plano = this.planoPendente();
    if (plano) this.selecionado.set(plano);
    this.mostrarConfirmacaoTroca.set(false);
    this.planoPendente.set(null);
  }

  cancelarTroca(): void {
    this.mostrarConfirmacaoTroca.set(false);
    this.planoPendente.set(null);
  }

  private confirmarSelecao(): void {
    const plano = this.selecionado();
    if (!plano) return;
    this.dados.selecionarPlano(plano);
    this.router.navigate(['/adesao/verificacao-cpf']);
  }
}
