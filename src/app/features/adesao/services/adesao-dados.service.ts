import { Injectable, computed, signal } from '@angular/core';

export interface VinculoForm {
  empresa: string;
  matricula: string;
  cargo: string;
  salarioMensal: string;
  dataAdmissao: string;
  regimeContratacao: string;
  confirmado: boolean;
}

export interface DadosPessoaisForm {
  nomeCompleto: string;
  cpf: string;
  sexo: string;
  dataNascimento: string;
  estadoCivil: string;
  escolaridade: string;
  tipoDocumento: string;
  numeroDocumento: string;
  dataEmissao: string;
  nomeMae: string;
  nomePai: string;
}

export interface EnderecoForm {
  resideExterior: boolean;
  tipoEndereco: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  estado: string;
  cidade: string;
  pais: string;
  nif: string;
  principal: boolean;
}

export interface ContatoForm {
  telefoneTipo: string;
  telefone: string;
  telefonePrincipal: boolean;
  aceitaWhatsapp: boolean;
  aceitaSms: boolean;
  emailTipo: string;
  email: string;
  emailPrincipal: boolean;
}

export interface PepForm {
  isPep: boolean;
  relacao: string;
  cargo: string;
}

export interface PerfilInvestimentoForm {
  respostas: Record<number, string | string[]>;
  perfilIndicado: string;
  perfilEscolhido: string;
  confirmado: boolean;
}

export interface RegimeTributacaoForm {
  regime: 'progressivo' | 'regressivo';
}

export interface ContribuicaoForm {
  rendaMensalDesejada: string;
  idadeBeneficio: string;
  tipoBasica: 'valores' | 'porcentagem';
  valorBasico: string;
  percentualBasico: string;
  temAdicional: boolean;
  tipoAdicional: 'valores' | 'porcentagem';
  valorAdicional: string;
  percentualAdicional: string;
}

export interface DadosBancariosForm {
  finalidade: string;
  banco: string;
  tipoConta: string;
  agencia: string;
  numeroConta: string;
  digito: string;
  aceitaPix: boolean;
  tipoChavePix: string;
  chavePix: string;
  principal: boolean;
}

/**
 * Estado compartilhado dos dados preenchidos ao longo do wizard de adesão.
 * Cada página lê seus valores default daqui e grava de volta ao ser destruída,
 * permitindo que campos repetidos (ex.: CPF) sejam reaproveitados em etapas
 * posteriores (ex.: sugestão de Chave PIX).
 */
@Injectable({ providedIn: 'root' })
export class AdesaoDadosService {
  readonly vinculo = signal<VinculoForm>({
    empresa: 'ford',
    matricula: '75486',
    cargo: 'Engenheiro mecânico',
    salarioMensal: 'R$ 99.999,99',
    dataAdmissao: '20/11/2014',
    regimeContratacao: 'clt',
    confirmado: false,
  });

  readonly dadosPessoais = signal<DadosPessoaisForm>({
    nomeCompleto: 'João da Silva Souza',
    cpf: '999.999.999-1',
    sexo: 'masculino',
    dataNascimento: '20/12/1989',
    estadoCivil: 'solteiro',
    escolaridade: 'superior-completo',
    tipoDocumento: 'rg',
    numeroDocumento: '99.999.999-9',
    dataEmissao: '20/12/1989',
    nomeMae: 'Maria da Silva Souza',
    nomePai: 'João da Silva Souza',
  });

  readonly endereco = signal<EnderecoForm>({
    resideExterior: false,
    tipoEndereco: 'residencial',
    cep: '06210-020',
    endereco: 'Av. Ivan Souza Moraes de Siqueira Pinto',
    numero: '256',
    complemento: 'Apto 115 bloco 1',
    bairro: 'Nova Esperança',
    estado: 'sp',
    cidade: 'São Paulo',
    pais: '',
    nif: '',
    principal: false,
  });

  readonly contato = signal<ContatoForm>({
    telefoneTipo: 'pessoal',
    telefone: '(11) 96587-8956',
    telefonePrincipal: false,
    aceitaWhatsapp: false,
    aceitaSms: false,
    emailTipo: 'pessoal',
    email: 'emailparticipante@entidade.com.br',
    emailPrincipal: false,
  });

  readonly pep = signal<PepForm>({
    isPep: false,
    relacao: 'primo',
    cargo: 'Prefeito',
  });

  readonly perfilInvestimento = signal<PerfilInvestimentoForm>({
    respostas: {},
    perfilIndicado: 'conservador',
    perfilEscolhido: '',
    confirmado: false,
  });

  readonly regimeTributacao = signal<RegimeTributacaoForm>({
    regime: 'regressivo',
  });

  readonly contribuicao = signal<ContribuicaoForm>({
    rendaMensalDesejada: 'R$ 7.500,00',
    idadeBeneficio: '65 anos',
    tipoBasica: 'porcentagem',
    valorBasico: '',
    percentualBasico: '5%',
    temAdicional: false,
    tipoAdicional: 'porcentagem',
    valorAdicional: '',
    percentualAdicional: '5%',
  });

  readonly dadosBancarios = signal<DadosBancariosForm>({
    finalidade: 'pessoal',
    banco: 'bradesco',
    tipoConta: 'corrente',
    agencia: '3750',
    numeroConta: '16598-69',
    digito: '03',
    aceitaPix: false,
    tipoChavePix: 'cpf',
    chavePix: '598.568.895-65',
    principal: false,
  });

  readonly documentos = signal<Record<string, string>>({});

  /** CPF do participante (Dados pessoais) sugerido como Chave PIX. */
  readonly cpfSugeridoPix = computed(() => this.dadosPessoais().cpf);

  updateVinculo(patch: Partial<VinculoForm>): void {
    this.vinculo.update(v => ({ ...v, ...patch }));
  }

  updateDadosPessoais(patch: Partial<DadosPessoaisForm>): void {
    this.dadosPessoais.update(v => ({ ...v, ...patch }));
  }

  updateEndereco(patch: Partial<EnderecoForm>): void {
    this.endereco.update(v => ({ ...v, ...patch }));
  }

  updateContato(patch: Partial<ContatoForm>): void {
    this.contato.update(v => ({ ...v, ...patch }));
  }

  updatePep(patch: Partial<PepForm>): void {
    this.pep.update(v => ({ ...v, ...patch }));
  }

  updatePerfilInvestimento(patch: Partial<PerfilInvestimentoForm>): void {
    this.perfilInvestimento.update(v => ({ ...v, ...patch }));
  }

  updateRegimeTributacao(patch: Partial<RegimeTributacaoForm>): void {
    this.regimeTributacao.update(v => ({ ...v, ...patch }));
  }

  updateContribuicao(patch: Partial<ContribuicaoForm>): void {
    this.contribuicao.update(v => ({ ...v, ...patch }));
  }

  updateDadosBancarios(patch: Partial<DadosBancariosForm>): void {
    this.dadosBancarios.update(v => ({ ...v, ...patch }));
  }

  updateDocumento(label: string, fileName: string): void {
    this.documentos.update(v => ({ ...v, [label]: fileName }));
  }
}
