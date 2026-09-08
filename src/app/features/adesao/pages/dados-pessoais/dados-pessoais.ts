import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LemeTextFieldComponent, LemeSelectComponent, LemeMessageComponent } from 'leme';
import { AdesaoDadosService } from '../../services/adesao-dados.service';
import { AdesaoService } from '../../services/adesao.service';
import { calcularIdade } from '@shared/utils/idade.util';

@Component({
  selector: 'app-dados-pessoais',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LemeTextFieldComponent, LemeSelectComponent, LemeMessageComponent],
  templateUrl: './dados-pessoais.html',
  styleUrl: './dados-pessoais.scss',
})
export class DadosPessoais implements OnInit, OnDestroy {
  private readonly dados = inject(AdesaoDadosService);
  protected readonly adesao = inject(AdesaoService);
  private readonly router = inject(Router);

  readonly sexoOptions = [
    { value: 'feminino',  label: 'Feminino' },
    { value: 'masculino', label: 'Masculino' },
    { value: 'outro',     label: 'Outro' },
  ];

  readonly estadoCivilOptions = [
    { value: 'solteiro',   label: 'Solteiro(a)' },
    { value: 'casado',     label: 'Casado(a)' },
    { value: 'divorciado', label: 'Divorciado(a)' },
    { value: 'viuvo',      label: 'Viúvo(a)' },
  ];

  readonly escolaridadeOptions = [
    { value: 'fundamental-incompleto', label: 'Fundamental Incompleto' },
    { value: 'fundamental-completo',   label: 'Fundamental Completo' },
    { value: 'medio-incompleto',       label: 'Médio Incompleto' },
    { value: 'medio-completo',         label: 'Médio Completo' },
    { value: 'superior-incompleto',    label: 'Superior Incompleto' },
    { value: 'superior-completo',      label: 'Superior Completo' },
    { value: 'pos-graduacao',          label: 'Pós-graduação' },
  ];

  readonly tipoDocumentoOptions = [
    { value: 'rg',          label: 'RG' },
    { value: 'cnh',         label: 'CNH' },
    { value: 'passaporte',  label: 'Passaporte' },
  ];

  nomeCompleto = '';
  cpf = '';
  sexo = '';
  dataNascimento = '';
  estadoCivil = '';
  escolaridade = '';
  tipoDocumento = '';
  numeroDocumento = '';
  dataEmissao = '';
  nomeMae = '';
  nomePai = '';

  /** RN17/Fluxo C item 4.1: menor de idade cujo plano selecionado não aceita menor. */
  readonly menorNaoPermitido = signal(false);

  ngOnInit(): void {
    const atual = this.dados.dadosPessoais();
    this.nomeCompleto = atual.nomeCompleto;
    this.cpf = atual.cpf;
    this.sexo = atual.sexo;
    this.dataNascimento = atual.dataNascimento;
    this.estadoCivil = atual.estadoCivil;
    this.escolaridade = atual.escolaridade;
    this.tipoDocumento = atual.tipoDocumento;
    this.numeroDocumento = atual.numeroDocumento;
    this.dataEmissao = atual.dataEmissao;
    this.nomeMae = atual.nomeMae;
    this.nomePai = atual.nomePai;

    this.adesao.setNextOverride(() => this.avancar());
  }

  ngOnDestroy(): void {
    this.persistir();
    this.adesao.setNextOverride(null);
  }

  voltarParaSelecaoPlano(): void {
    this.router.navigate(['/adesao/selecao-plano']);
  }

  private persistir(): void {
    this.dados.updateDadosPessoais({
      nomeCompleto: this.nomeCompleto,
      cpf: this.cpf,
      sexo: this.sexo,
      dataNascimento: this.dataNascimento,
      estadoCivil: this.estadoCivil,
      escolaridade: this.escolaridade,
      tipoDocumento: this.tipoDocumento,
      numeroDocumento: this.numeroDocumento,
      dataEmissao: this.dataEmissao,
      nomeMae: this.nomeMae,
      nomePai: this.nomePai,
    });
  }

  /**
   * RN17-20: calcula a idade ao avançar, antes de navegar. Menor de idade em
   * plano que não aceita (Fluxo C item 4.1) bloqueia o avanço; nos demais
   * casos, o próprio steps() do AdesaoService já recalcula a rota seguinte
   * (com ou sem a etapa "Representantes") a partir do dado recém-persistido.
   */
  private avancar(): void {
    this.persistir();
    this.menorNaoPermitido.set(false);

    const idade = calcularIdade(this.dataNascimento);
    const plano = this.dados.planoSelecionado();

    if (idade < 18 && plano && !plano.aceitaMenor) {
      this.menorNaoPermitido.set(true);
      return;
    }

    this.adesao.setNextOverride(null);
    this.adesao.next();
  }
}
