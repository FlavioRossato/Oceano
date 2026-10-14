import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LemeButtonComponent, LemeMessageComponent, LemeSelectComponent, LemeTextFieldComponent } from 'leme';
import { MultiFileUpload, UploadedFile } from '@shared/components/multi-file-upload/multi-file-upload';
import { isValidCpf, onlyDigits } from '@shared/utils/cpf-format.util';
import { isValidEmail } from '@shared/utils/email-validate.util';
import { calcularIdade, isDataBrValida } from '@shared/utils/idade.util';
import { mascararCpf, mascararData, mascararNome } from '@shared/utils/mascaramento.util';
import { RELACOES_MENOR_MOCK } from '../../data/relacoes-menor-mock.data';
import { RepresentanteForm } from '../../services/adesao-dados.service';
import { ParticipanteMockService } from '../../services/participante-mock.service';

export type RepresentanteFields = Omit<RepresentanteForm, 'documentos'>;
export type RepresentanteErros = Partial<Record<keyof RepresentanteFields | 'documentos', string>>;

export const SEXO_OPTIONS = [
  { value: 'feminino', label: 'Feminino' },
  { value: 'masculino', label: 'Masculino' },
];

export const ESTADO_CIVIL_OPTIONS = [
  { value: 'solteiro', label: 'Solteiro(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viuvo', label: 'Viúvo(a)' },
];

export const ESCOLARIDADE_OPTIONS = [
  { value: 'fundamental-incompleto', label: 'Fundamental Incompleto' },
  { value: 'fundamental-completo', label: 'Fundamental Completo' },
  { value: 'medio-incompleto', label: 'Médio Incompleto' },
  { value: 'medio-completo', label: 'Médio Completo' },
  { value: 'superior-incompleto', label: 'Superior Incompleto' },
  { value: 'superior-completo', label: 'Superior Completo' },
  { value: 'pos-graduacao', label: 'Pós-graduação' },
];

export function exigeRelacaoLivre(relacao: string): boolean {
  return RELACOES_MENOR_MOCK.find(r => r.value === relacao)?.permiteLivre === true;
}

function erroCpf(cpf: string, cpfMenor: string, rotulo: string): string {
  if (!isValidCpf(cpf)) return 'CPF inválido. Confira os números digitados.';
  if (onlyDigits(cpf) === cpfMenor) return `O CPF do ${rotulo} não pode ser igual ao CPF do titular menor de idade.`;
  return '';
}

/**
 * RN09-13/RN18: validações de um representante, indexadas por campo para que
 * o bloco destaque cada campo com sua própria mensagem. Antes da busca por
 * CPF (origemCadastro === '') só o CPF é avaliado — os demais campos nem
 * estão visíveis ainda (RN14).
 */
export function validarRepresentante(
  rep: RepresentanteFields,
  documentos: UploadedFile[],
  cpfMenor: string,
  rotulo: string,
): RepresentanteErros {
  const erros: RepresentanteErros = {};

  const cpf = erroCpf(rep.cpf, cpfMenor, rotulo);
  if (cpf) erros.cpf = cpf;
  else if (!rep.origemCadastro) erros.cpf = `Busque o CPF do ${rotulo} para continuar.`;
  if (!rep.origemCadastro) return erros;

  if (rep.nome.trim().split(/\s+/).filter(Boolean).length < 2) erros.nome = 'Informe o nome completo (nome e sobrenome).';

  if (!isDataBrValida(rep.dataNascimento)) {
    erros.dataNascimento = 'Informe uma data de nascimento válida.';
  } else if (calcularIdade(rep.dataNascimento) < 18) {
    erros.dataNascimento = `O ${rotulo} deve ter 18 anos ou mais.`;
  }

  if (!rep.sexo) erros.sexo = 'Selecione o sexo.';
  if (!rep.estadoCivil) erros.estadoCivil = 'Selecione o estado civil.';
  if (!rep.escolaridade) erros.escolaridade = 'Selecione a escolaridade.';
  if (onlyDigits(rep.telefone).length !== 11) erros.telefone = 'Informe um celular válido, com DDD.';
  if (!isValidEmail(rep.email)) erros.email = 'Informe um e-mail válido.';
  if (rep.emailConfirmacao.trim().toLowerCase() !== rep.email.trim().toLowerCase()) {
    erros.emailConfirmacao = 'Os e-mails informados não conferem.';
  }
  if (!rep.relacaoComMenor) erros.relacaoComMenor = 'Selecione a relação com o menor.';
  if (exigeRelacaoLivre(rep.relacaoComMenor) && !rep.relacaoOutraDescricao.trim()) {
    erros.relacaoOutraDescricao = 'Descreva a relação com o menor.';
  }
  if (!documentos.length) erros.documentos = 'Envie o documento comprobatório da relação.';

  return erros;
}

/**
 * Bloco de cadastro de um representante (legal ou financeiro): CPF primeiro,
 * busca na base do Navega e só então os demais campos — bloqueados e
 * mascarados quando a pessoa já existe (RN15), livres quando não (RN16).
 * Edita o objeto `rep` recebido diretamente, como o restante do wizard.
 */
@Component({
  selector: 'app-representante-bloco',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LemeButtonComponent, LemeMessageComponent, LemeSelectComponent, LemeTextFieldComponent, MultiFileUpload],
  templateUrl: './representante-bloco.html',
  styleUrl: './representante-bloco.scss',
})
export class RepresentanteBloco {
  private readonly participanteMock = inject(ParticipanteMockService);

  @Input({ required: true }) rep!: RepresentanteFields;
  @Input() documentos: UploadedFile[] = [];
  @Input() cpfMenor = '';
  @Input() rotulo = '';
  /** Prefixo dos atributos `name` — mantém os nomes únicos com dois blocos na mesma página. */
  @Input() prefixo = '';
  @Input() mostrarErros = false;
  @Output() documentosChange = new EventEmitter<UploadedFile[]>();

  readonly relacaoOptions = RELACOES_MENOR_MOCK.map(r => ({ value: r.value, label: r.label }));
  readonly sexoOptions = SEXO_OPTIONS;
  readonly estadoCivilOptions = ESTADO_CIVIL_OPTIONS;
  readonly escolaridadeOptions = ESCOLARIDADE_OPTIONS;

  /** Erro da tentativa de busca (independe de `mostrarErros`, que só liga ao tentar avançar). */
  readonly erroBusca = signal('');

  get bloqueado(): boolean {
    return this.rep.origemCadastro === 'navega';
  }

  get erros(): RepresentanteErros {
    return this.mostrarErros ? validarRepresentante(this.rep, this.documentos, this.cpfMenor, this.rotulo) : {};
  }

  get erroCpfExibido(): string {
    return this.erroBusca() || this.erros.cpf || '';
  }

  get nomeExibido(): string {
    return this.bloqueado ? mascararNome(this.rep.nome) : this.rep.nome;
  }

  get cpfExibido(): string {
    return this.bloqueado ? mascararCpf(this.rep.cpf) : this.rep.cpf;
  }

  get dataNascimentoExibida(): string {
    return this.bloqueado ? mascararData(this.rep.dataNascimento) : this.rep.dataNascimento;
  }

  documentoAceito(relacao: string): string {
    return RELACOES_MENOR_MOCK.find(r => r.value === relacao)?.documentoAceito ?? '';
  }

  exigeRelacaoLivre(relacao: string): boolean {
    return exigeRelacaoLivre(relacao);
  }

  onCpfChange(value: string): void {
    this.rep.cpf = value;
    this.erroBusca.set('');
  }

  /** RN14/RN18: a busca só acontece com CPF válido e diferente do CPF do menor. */
  buscarCpf(): void {
    const erro = erroCpf(this.rep.cpf, this.cpfMenor, this.rotulo);
    if (erro) {
      this.erroBusca.set(erro);
      return;
    }

    this.erroBusca.set('');
    const pessoa = this.participanteMock.buscarPessoaNavega(onlyDigits(this.rep.cpf));

    if (pessoa) {
      Object.assign(this.rep, {
        nome: pessoa.nome,
        dataNascimento: pessoa.dataNascimento,
        sexo: pessoa.sexo,
        escolaridade: pessoa.escolaridade,
        estadoCivil: pessoa.estadoCivil,
        telefone: pessoa.telefone,
        email: pessoa.email,
        emailConfirmacao: pessoa.email,
        origemCadastro: 'navega',
      });
    } else {
      Object.assign(this.rep, { ...this.camposCadastraisVazios(), origemCadastro: 'manual' });
    }
  }

  /** Volta para a etapa de CPF descartando os dados da pessoa anterior (inclusive documentos). */
  alterarCpf(): void {
    Object.assign(this.rep, { ...this.camposCadastraisVazios(), relacaoComMenor: '', relacaoOutraDescricao: '', origemCadastro: '' });
    this.documentosChange.emit([]);
  }

  private camposCadastraisVazios(): Partial<RepresentanteFields> {
    return { nome: '', dataNascimento: '', sexo: '', escolaridade: '', estadoCivil: '', telefone: '', email: '', emailConfirmacao: '' };
  }
}
