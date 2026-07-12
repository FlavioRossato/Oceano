import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LemeTextFieldComponent, LemeSelectComponent } from 'leme';
import { AdesaoDadosService } from '../../services/adesao-dados.service';
import { formatCpfInput } from '@shared/utils/cpf-format.util';

@Component({
  selector: 'app-dados-pessoais',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LemeTextFieldComponent, LemeSelectComponent],
  templateUrl: './dados-pessoais.html',
  styleUrl: './dados-pessoais.scss',
})
export class DadosPessoais implements OnInit, OnDestroy {
  private readonly dados = inject(AdesaoDadosService);

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

  onCpfChange(value: string): void {
    this.cpf = formatCpfInput(value);
  }

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
  }

  ngOnDestroy(): void {
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
}
