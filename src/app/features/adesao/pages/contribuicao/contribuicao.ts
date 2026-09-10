import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { AdesaoDadosService } from '../../services/adesao-dados.service';
import { AdesaoService } from '../../services/adesao.service';
import { formatCurrencyInput, parseCurrencyToNumber, parsePercentToNumber } from '@shared/utils/currency-format.util';

const BASICA_MIN = 1;
const BASICA_MAX = 2;
const ADICIONAL_MIN = 0;
const ADICIONAL_MAX = 5;
const SUPLEMENTAR_MIN = 0;
const SUPLEMENTAR_MAX = 22;

@Component({
  selector: 'app-contribuicao',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contribuicao.html',
  styleUrl: './contribuicao.scss',
})
export class Contribuicao implements OnDestroy {
  private readonly dados = inject(AdesaoDadosService);
  protected readonly adesao = inject(AdesaoService);

  private readonly atual = this.dados.contribuicao();

  /**
   * Plano Instituído não tem etapa "Vínculo" (RN11), então o salário nunca
   * foi coletado — precisa ser pedido aqui, antes das contribuições.
   */
  readonly precisaSalario = computed(() => this.dados.isPlanoInstituido());
  readonly salarioInput = signal(this.precisaSalario() ? '' : this.dados.vinculo().salarioMensal);

  readonly salarioMensal = computed(() =>
    parseCurrencyToNumber(this.precisaSalario() ? this.salarioInput() : this.dados.vinculo().salarioMensal)
  );

  readonly percentualBasico = signal(this.atual.percentualBasico);
  readonly percentualAdicional = signal(this.atual.percentualAdicional);
  readonly percentualSuplementar = signal(this.atual.percentualSuplementar);

  readonly valorBasico = computed(() => this.calcularValor(this.percentualBasico()));
  readonly valorAdicional = computed(() => this.calcularValor(this.percentualAdicional()));
  readonly valorSuplementar = computed(() => this.calcularValor(this.percentualSuplementar()));

  readonly totalMensal = computed(() => this.formatCurrency(this.valorBasico() + this.valorAdicional() + this.valorSuplementar()));

  /**
   * Suplementar só é permitida quando básica e adicional já estão no percentual
   * máximo — regra herdada da tela atual do plano.
   */
  readonly suplementarHabilitada = computed(
    () => parsePercentToNumber(this.percentualBasico()) === BASICA_MAX && parsePercentToNumber(this.percentualAdicional()) === ADICIONAL_MAX
  );

  constructor() {
    effect(
      () => {
        if (!this.suplementarHabilitada() && parsePercentToNumber(this.percentualSuplementar()) > 0) {
          this.percentualSuplementar.set(`${SUPLEMENTAR_MIN}%`);
        }
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        this.adesao.setCanContinue(!this.precisaSalario() || parseCurrencyToNumber(this.salarioInput()) > 0);
      },
      { allowSignalWrites: true }
    );
  }

  onSalarioInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatCurrencyInput(input.value);
    input.value = formatted;
    input.setSelectionRange(formatted.length, formatted.length);
    this.salarioInput.set(formatted);
  }

  onPercentualBasicoInput(event: Event): void {
    this.percentualBasico.set(this.applyClamp(event, BASICA_MIN, BASICA_MAX));
  }

  onPercentualAdicionalInput(event: Event): void {
    this.percentualAdicional.set(this.applyClamp(event, ADICIONAL_MIN, ADICIONAL_MAX));
  }

  onPercentualSuplementarInput(event: Event): void {
    if (!this.suplementarHabilitada()) return;
    this.percentualSuplementar.set(this.applyClamp(event, SUPLEMENTAR_MIN, SUPLEMENTAR_MAX));
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  private calcularValor(percentual: string): number {
    return (this.salarioMensal() * parsePercentToNumber(percentual)) / 100;
  }

  /** Percentual inteiro, restrito ao intervalo [min, max] da contribuição. */
  private clampPercent(raw: string, min: number, max: number): string {
    const digits = raw.replace(/\D/g, '').slice(0, 3);
    if (!digits) return '';
    const value = Math.min(max, Math.max(min, Number(digits)));
    return `${value}%`;
  }

  /**
   * Aplica a máscara e corrige o valor/cursor do input de forma síncrona —
   * sem isso, o próximo keystroke chega antes do re-render do Angular e o
   * cursor acaba fora de posição, corrompendo os dígitos digitados.
   */
  private applyClamp(event: Event, min: number, max: number): string {
    const input = event.target as HTMLInputElement;
    const formatted = this.clampPercent(input.value, min, max);
    input.value = formatted;
    input.setSelectionRange(formatted.length, formatted.length);
    return formatted;
  }

  ngOnDestroy(): void {
    this.adesao.setCanContinue(true);

    if (this.precisaSalario()) {
      this.dados.updateVinculo({ salarioMensal: this.salarioInput() });
    }

    this.dados.updateContribuicao({
      percentualBasico: this.percentualBasico(),
      percentualAdicional: this.percentualAdicional(),
      percentualSuplementar: this.percentualSuplementar(),
    });
  }
}
