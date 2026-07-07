import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { LemeRadioComponent, LemeSwitchComponent, LemeMessageComponent } from 'leme';
import { AdesaoService } from '../../services/adesao.service';
import { AdesaoDadosService } from '../../services/adesao-dados.service';
import { formatCurrencyInput, formatPercentInput, parseCurrencyToNumber, parsePercentToNumber } from '@shared/utils/currency-format.util';

type TipoContribuicao = 'valores' | 'porcentagem';

const CONTRIBUICAO_MINIMA = 500;

@Component({
  selector: 'app-contribuicao',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LemeRadioComponent, LemeSwitchComponent, LemeMessageComponent],
  templateUrl: './contribuicao.html',
  styleUrl: './contribuicao.scss',
})
export class Contribuicao implements OnDestroy {
  private readonly adesao = inject(AdesaoService);
  private readonly dados = inject(AdesaoDadosService);

  private readonly atual = this.dados.contribuicao();

  readonly rendaMensalDesejada = signal(this.atual.rendaMensalDesejada);
  readonly idadeBeneficio = signal(this.atual.idadeBeneficio);

  readonly tipoBasica = signal<TipoContribuicao>(this.atual.tipoBasica);
  readonly valorBasico = signal(this.atual.valorBasico);
  readonly percentualBasico = signal(this.atual.percentualBasico);

  readonly temAdicional = signal(this.atual.temAdicional);
  readonly tipoAdicional = signal<TipoContribuicao>(this.atual.tipoAdicional);
  readonly valorAdicional = signal(this.atual.valorAdicional);
  readonly percentualAdicional = signal(this.atual.percentualAdicional);

  private readonly rendaMensalValor = computed(() => parseCurrencyToNumber(this.rendaMensalDesejada()));

  private readonly contribuicaoBasicaValor = computed(() => {
    if (this.tipoBasica() === 'valores') {
      return parseCurrencyToNumber(this.valorBasico());
    }

    return (this.rendaMensalValor() * parsePercentToNumber(this.percentualBasico())) / 100;
  });

  private readonly contribuicaoAdicionalValor = computed(() => {
    if (!this.temAdicional()) {
      return 0;
    }

    if (this.tipoAdicional() === 'valores') {
      return parseCurrencyToNumber(this.valorAdicional());
    }

    return (this.rendaMensalValor() * parsePercentToNumber(this.percentualAdicional())) / 100;
  });

  readonly suaContribuicao = computed(() => this.formatCurrency(this.contribuicaoBasicaValor() + this.contribuicaoAdicionalValor()));
  readonly totalInvestido = computed(() => this.suaContribuicao());

  readonly percentualBasicaNoDonut = computed(() => {
    const total = this.contribuicaoBasicaValor() + this.contribuicaoAdicionalValor();
    if (!total) return 0;
    return (this.contribuicaoBasicaValor() / total) * 100;
  });

  readonly donutBackground = computed(
    () =>
      `conic-gradient(var(--color-chart-green-60) 0% ${this.percentualBasicaNoDonut()}%, var(--color-chart-teal-60) ${this.percentualBasicaNoDonut()}% 100%)`
  );

  readonly erroValorBasico = computed(
    () => this.tipoBasica() === 'valores' && parseCurrencyToNumber(this.valorBasico()) < CONTRIBUICAO_MINIMA
  );

  readonly erroValorAdicional = computed(
    () =>
      this.temAdicional() &&
      this.tipoAdicional() === 'valores' &&
      parseCurrencyToNumber(this.valorAdicional()) < CONTRIBUICAO_MINIMA
  );

  constructor() {
    effect(
      () => {
        this.adesao.setCanContinue(!this.erroValorBasico() && !this.erroValorAdicional());
      },
      { allowSignalWrites: true }
    );
  }

  onRendaInput(event: Event): void {
    this.rendaMensalDesejada.set(this.applyMask(event, formatCurrencyInput));
  }

  onIdadeInput(event: Event): void {
    this.idadeBeneficio.set((event.target as HTMLInputElement).value);
  }

  onValorBasicoInput(event: Event): void {
    this.valorBasico.set(this.applyMask(event, formatCurrencyInput));
  }

  onPercentualBasicoInput(event: Event): void {
    this.percentualBasico.set(this.applyMask(event, formatPercentInput));
  }

  onValorAdicionalInput(event: Event): void {
    this.valorAdicional.set(this.applyMask(event, formatCurrencyInput));
  }

  onPercentualAdicionalInput(event: Event): void {
    this.percentualAdicional.set(this.applyMask(event, formatPercentInput));
  }

  /**
   * Aplica a máscara e corrige o valor/cursor do input de forma síncrona —
   * sem isso, o próximo keystroke chega antes do re-render do Angular e o
   * cursor acaba fora de posição, corrompendo os dígitos digitados.
   */
  private applyMask(event: Event, mask: (raw: string) => string): string {
    const input = event.target as HTMLInputElement;
    const formatted = mask(input.value);
    input.value = formatted;
    input.setSelectionRange(formatted.length, formatted.length);
    return formatted;
  }

  private formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  ngOnDestroy(): void {
    this.adesao.setCanContinue(true);
    this.dados.updateContribuicao({
      rendaMensalDesejada: this.rendaMensalDesejada(),
      idadeBeneficio: this.idadeBeneficio(),
      tipoBasica: this.tipoBasica(),
      valorBasico: this.valorBasico(),
      percentualBasico: this.percentualBasico(),
      temAdicional: this.temAdicional(),
      tipoAdicional: this.tipoAdicional(),
      valorAdicional: this.valorAdicional(),
      percentualAdicional: this.percentualAdicional(),
    });
  }
}
