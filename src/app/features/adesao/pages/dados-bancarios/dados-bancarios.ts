import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LemeTextFieldComponent, LemeSelectComponent, LemeSwitchComponent, LemeCheckboxComponent, LemeMessageComponent } from 'leme';
import { onlyDigits } from '@shared/utils/cpf-format.util';
import { AdesaoDadosService } from '../../services/adesao-dados.service';
import { AdesaoService } from '../../services/adesao.service';

@Component({
  selector: 'app-dados-bancarios',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LemeTextFieldComponent, LemeSelectComponent, LemeSwitchComponent, LemeCheckboxComponent, LemeMessageComponent],
  templateUrl: './dados-bancarios.html',
  styleUrl: './dados-bancarios.scss',
})
export class DadosBancarios implements OnInit, OnDestroy {
  protected readonly dados = inject(AdesaoDadosService);
  protected readonly adesao = inject(AdesaoService);

  readonly finalidadeOptions = [
    { value: 'pessoal',    label: 'Pessoal' },
    { value: 'empresarial', label: 'Empresarial' },
  ];

  readonly bancoOptions = [
    { value: 'banco-do-brasil', label: 'Banco do Brasil' },
    { value: 'bradesco',        label: 'Bradesco' },
    { value: 'itau',            label: 'Itaú' },
    { value: 'santander',       label: 'Santander' },
    { value: 'caixa',           label: 'Caixa Econômica Federal' },
    { value: 'nubank',          label: 'Nubank' },
    { value: 'inter',           label: 'Banco Inter' },
  ];

  readonly tipoContaOptions = [
    { value: 'corrente',  label: 'Corrente' },
    { value: 'poupanca',  label: 'Poupança' },
  ];

  readonly tipoChavePixOptions = [
    { value: 'cpf',       label: 'CPF' },
    { value: 'cnpj',      label: 'CNPJ' },
    { value: 'email',     label: 'E-mail' },
    { value: 'telefone',  label: 'Telefone' },
    { value: 'aleatoria', label: 'Aleatória' },
  ];

  finalidade = '';
  banco = '';
  tipoConta = '';
  agencia = '';
  numeroConta = '';
  digito = '';
  aceitaPix = false;
  tipoChavePix = '';
  chavePix = '';
  principal = false;

  /** Exigidos só quando o titular é menor de idade — conta deve ser do representante financeiro. */
  titularNome = '';
  titularCpf = '';

  readonly divergenciaTitularidade = signal(false);

  ngOnInit(): void {
    const atual = this.dados.dadosBancarios();
    this.finalidade = atual.finalidade;
    this.banco = atual.banco;
    this.tipoConta = atual.tipoConta;
    this.agencia = atual.agencia;
    this.numeroConta = atual.numeroConta;
    this.digito = atual.digito;
    this.aceitaPix = atual.aceitaPix;
    this.tipoChavePix = atual.tipoChavePix;
    this.chavePix = atual.chavePix;
    this.principal = atual.principal;
    this.titularNome = atual.titularNome;
    this.titularCpf = atual.titularCpf;

    this.adesao.setNextOverride(() => this.avancar());
  }

  /** Ao escolher "CPF" como tipo de chave, sugere o CPF já informado em Dados pessoais. */
  onTipoChavePixChange(value: string): void {
    this.tipoChavePix = value;
    if (value === 'cpf') {
      this.chavePix = this.dados.cpfSugeridoPix();
    }
  }

  ngOnDestroy(): void {
    this.persistir();
    this.adesao.setNextOverride(null);
  }

  private persistir(): void {
    this.dados.updateDadosBancarios({
      finalidade: this.finalidade,
      banco: this.banco,
      tipoConta: this.tipoConta,
      agencia: this.agencia,
      numeroConta: this.numeroConta,
      digito: this.digito,
      aceitaPix: this.aceitaPix,
      tipoChavePix: this.tipoChavePix,
      chavePix: this.chavePix,
      principal: this.principal,
      titularNome: this.titularNome,
      titularCpf: this.titularCpf,
    });
  }

  /** Quando o titular é menor, a conta deve ser do representante financeiro (RN de titularidade bancária). */
  private avancar(): void {
    this.divergenciaTitularidade.set(false);

    if (this.dados.isMenorDeIdade() && this.titularCpf) {
      const cpfInformado = onlyDigits(this.titularCpf);
      const cpfEsperado = onlyDigits(this.dados.representanteFinanceiro().cpf);
      if (cpfEsperado && cpfInformado !== cpfEsperado) {
        this.divergenciaTitularidade.set(true);
        return;
      }
    }

    this.persistir();
    this.adesao.setNextOverride(null);
    this.adesao.next();
  }
}
