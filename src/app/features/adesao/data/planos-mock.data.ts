export type TipoPlano = 'instituido' | 'patrocinado';

export interface Plano {
  id: string;
  nome: string;
  tipo: TipoPlano;
  descricaoResumida: string;
  linkRegulamento?: string;
  /** Se o plano permite adesão de titular menor de idade. */
  aceitaMenor: boolean;
  /** Nome da patrocinadora — presente apenas quando tipo === 'patrocinado'. */
  patrocinadoraNome?: string;
}

/**
 * Base mock de planos abertos à adesão via Portal, usada na etapa de seleção
 * de plano. Para simular "sem plano disponível", basta esvaziar este array.
 */
export const PLANOS_MOCK: Plano[] = [
  {
    id: 'previ-instituido',
    nome: 'PrevInstituído',
    tipo: 'instituido',
    descricaoResumida: 'Plano de previdência complementar aberto a associados do instituidor, sem vínculo empregatício.',
    linkRegulamento: 'https://www.visaoprev.com.br/',
    aceitaMenor: true,
  },
  {
    id: 'previ-patrocinado',
    nome: 'PrevPatrocinado',
    tipo: 'patrocinado',
    descricaoResumida: 'Plano de previdência complementar patrocinado, exclusivo para empregados vinculados à patrocinadora.',
    linkRegulamento: 'https://www.visaoprev.com.br/',
    aceitaMenor: false,
    patrocinadoraNome: 'Ford',
  },
];

export interface ElegibilidadePatrocinado {
  /** Somente dígitos. */
  cpf: string;
  planoId: string;
}

/**
 * Simula a base de vínculo empregatício com a patrocinadora, consultada na
 * etapa de identificação por CPF quando o plano selecionado é Patrocinado.
 */
export const ELEGIBILIDADE_PATROCINADO_MOCK: ElegibilidadePatrocinado[] = [
  { cpf: '99999999991', planoId: 'previ-patrocinado' },
];
