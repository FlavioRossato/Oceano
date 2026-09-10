import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LemeButtonComponent, LemeMessageComponent, LemeModalComponent, LemeSelectComponent, LemeSwitchComponent, LemeTextFieldComponent } from 'leme';
import { MultiFileUpload, UploadedFile } from '@shared/components/multi-file-upload/multi-file-upload';
import { isValidCpf, onlyDigits } from '@shared/utils/cpf-format.util';
import { calcularIdade } from '@shared/utils/idade.util';
import { RELACOES_MENOR_MOCK } from '../../data/relacoes-menor-mock.data';
import { AdesaoDadosService, RepresentanteForm } from '../../services/adesao-dados.service';
import { AdesaoService } from '../../services/adesao.service';

type RepresentanteFields = Omit<RepresentanteForm, 'documentos'>;

function representanteFieldsVazio(): RepresentanteFields {
  return {
    nome: '',
    cpf: '',
    dataNascimento: '',
    sexo: '',
    escolaridade: '',
    estadoCivil: '',
    telefone: '',
    email: '',
    relacaoComMenor: '',
    relacaoOutraDescricao: '',
  };
}

@Component({
  selector: 'app-representantes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    LemeButtonComponent,
    LemeMessageComponent,
    LemeModalComponent,
    LemeSelectComponent,
    LemeSwitchComponent,
    LemeTextFieldComponent,
    MultiFileUpload,
  ],
  templateUrl: './representantes.html',
  styleUrl: './representantes.scss',
})
export class Representantes implements OnInit, OnDestroy {
  private readonly dados = inject(AdesaoDadosService);
  protected readonly adesao = inject(AdesaoService);

  readonly relacaoOptions = RELACOES_MENOR_MOCK.map(r => ({ value: r.value, label: r.label }));

  readonly sexoOptions = [
    { value: 'feminino', label: 'Feminino' },
    { value: 'masculino', label: 'Masculino' },
    { value: 'outro', label: 'Outro' },
  ];

  readonly estadoCivilOptions = [
    { value: 'solteiro', label: 'Solteiro(a)' },
    { value: 'casado', label: 'Casado(a)' },
    { value: 'divorciado', label: 'Divorciado(a)' },
    { value: 'viuvo', label: 'Viúvo(a)' },
  ];

  readonly escolaridadeOptions = [
    { value: 'fundamental-incompleto', label: 'Fundamental Incompleto' },
    { value: 'fundamental-completo', label: 'Fundamental Completo' },
    { value: 'medio-incompleto', label: 'Médio Incompleto' },
    { value: 'medio-completo', label: 'Médio Completo' },
    { value: 'superior-incompleto', label: 'Superior Incompleto' },
    { value: 'superior-completo', label: 'Superior Completo' },
    { value: 'pos-graduacao', label: 'Pós-graduação' },
  ];

  legal: RepresentanteFields = representanteFieldsVazio();
  financeiro: RepresentanteFields = representanteFieldsVazio();

  readonly legalDocumentos = signal<UploadedFile[]>([]);
  readonly financeiroDocumentos = signal<UploadedFile[]>([]);
  readonly autorizacaoDocumentos = signal<UploadedFile[]>([]);

  /** null = pergunta ainda não respondida (RN23). */
  readonly mesmaPessoa = signal<boolean | null>(null);
  readonly mostrarConfirmacaoDescarte = signal(false);

  readonly erros = signal<string[]>([]);

  ngOnInit(): void {
    const legal = this.dados.representanteLegal();
    this.legal = { ...legal };
    this.legalDocumentos.set(legal.documentos.map(name => ({ name, size: 0 })));

    const financeiro = this.dados.representanteFinanceiro();
    this.financeiro = { ...financeiro };
    this.financeiroDocumentos.set(financeiro.documentos.map(name => ({ name, size: 0 })));

    this.mesmaPessoa.set(this.dados.mesmaPessoaRepresentantes());

    this.adesao.setNextOverride(() => this.avancar());
  }

  ngOnDestroy(): void {
    this.persistir();
    this.adesao.setNextOverride(null);
  }

  documentoAceito(relacao: string): string {
    return RELACOES_MENOR_MOCK.find(r => r.value === relacao)?.documentoAceito ?? '';
  }

  exigeRelacaoLivre(relacao: string): boolean {
    return RELACOES_MENOR_MOCK.find(r => r.value === relacao)?.permiteLivre === true;
  }

  onMesmaPessoaChange(value: boolean): void {
    const anterior = this.mesmaPessoa();

    // RN24: trocar de "não" para "sim" com dados do financeiro já preenchidos exige confirmação antes de descartar.
    if (value === true && anterior === false && this.temDadosFinanceiroPreenchidos()) {
      this.mostrarConfirmacaoDescarte.set(true);
      return;
    }

    this.aplicarMesmaPessoa(value);
  }

  confirmarDescarteFinanceiro(): void {
    this.aplicarMesmaPessoa(true);
    this.mostrarConfirmacaoDescarte.set(false);
  }

  cancelarDescarteFinanceiro(): void {
    this.mostrarConfirmacaoDescarte.set(false);
  }

  private aplicarMesmaPessoa(value: boolean): void {
    this.mesmaPessoa.set(value);
    this.dados.setMesmaPessoaRepresentantes(value);

    // RN24: trocar de "sim" para "não" limpa os campos replicados do financeiro.
    if (value === true) {
      this.financeiro = representanteFieldsVazio();
      this.financeiroDocumentos.set([]);
      this.autorizacaoDocumentos.set([]);
    }
  }

  private temDadosFinanceiroPreenchidos(): boolean {
    return !!(this.financeiro.nome || this.financeiro.cpf || this.financeiroDocumentos().length);
  }

  private persistir(): void {
    const legalDocs = this.legalDocumentos().map(f => f.name);
    this.dados.updateRepresentanteLegal({ ...this.legal, documentos: legalDocs });

    if (this.mesmaPessoa()) {
      this.dados.updateRepresentanteFinanceiro({ ...this.legal, documentos: legalDocs });
    } else {
      this.dados.updateRepresentanteFinanceiro({ ...this.financeiro, documentos: this.financeiroDocumentos().map(f => f.name) });
    }
  }

  /**
   * RN22/RN25-31: valida os dois papéis antes de avançar. RN27 é
   * deliberadamente permissivo — CPFs iguais em "não" não geram erro, viram
   * apenas um único cadastro nos dois papéis.
   */
  private avancar(): void {
    const erros: string[] = [];
    const cpfMenor = onlyDigits(this.dados.dadosPessoais().cpf);

    erros.push(...this.validarRepresentante(this.legal, this.legalDocumentos(), cpfMenor, 'representante legal'));

    if (this.mesmaPessoa() === null) {
      erros.push('Informe se o representante financeiro é a mesma pessoa do representante legal.');
    } else if (this.mesmaPessoa() === false) {
      erros.push(...this.validarRepresentante(this.financeiro, this.financeiroDocumentos(), cpfMenor, 'representante financeiro'));

      if (this.exigeRelacaoLivre(this.financeiro.relacaoComMenor) && !this.autorizacaoDocumentos().length) {
        erros.push('Envie a autorização do representante legal para o representante financeiro.');
      }
    }

    if (erros.length) {
      this.erros.set(erros);
      return;
    }

    this.erros.set([]);
    this.persistir();
    this.adesao.setNextOverride(null);
    this.adesao.next();
  }

  private validarRepresentante(rep: RepresentanteFields, documentos: UploadedFile[], cpfMenor: string, rotulo: string): string[] {
    const erros: string[] = [];

    if (!rep.nome.trim()) erros.push(`Informe o nome completo do ${rotulo}.`);
    if (!isValidCpf(rep.cpf)) erros.push(`CPF do ${rotulo} inválido.`);
    if (onlyDigits(rep.cpf) === cpfMenor) erros.push(`O CPF do ${rotulo} não pode ser igual ao do titular.`);
    if (!rep.dataNascimento) {
      erros.push(`Informe a data de nascimento do ${rotulo}.`);
    } else if (calcularIdade(rep.dataNascimento) < 18) {
      erros.push(`O ${rotulo} deve ser maior de idade.`);
    }
    if (!rep.sexo) erros.push(`Selecione o sexo do ${rotulo}.`);
    if (!rep.estadoCivil) erros.push(`Selecione o estado civil do ${rotulo}.`);
    if (!rep.escolaridade) erros.push(`Selecione a escolaridade do ${rotulo}.`);
    if (onlyDigits(rep.telefone).length < 10) erros.push(`Informe um telefone celular válido para o ${rotulo}.`);
    if (!rep.email.trim()) erros.push(`Informe o e-mail do ${rotulo}.`);
    if (!rep.relacaoComMenor) erros.push(`Selecione a relação do ${rotulo} com o menor.`);
    if (this.exigeRelacaoLivre(rep.relacaoComMenor) && !rep.relacaoOutraDescricao.trim()) {
      erros.push(`Descreva a relação do ${rotulo} com o menor.`);
    }
    if (!documentos.length) erros.push(`Envie o documento comprobatório do ${rotulo}.`);

    return erros;
  }
}
