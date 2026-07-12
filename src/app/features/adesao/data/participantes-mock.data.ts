export type StatusAdesao = 'novo' | 'em_andamento' | 'concluida' | 'aprovada' | 'negada';

export interface ParticipanteMock {
  /** Somente dígitos. */
  cpf: string;
  nome: string;
  status: StatusAdesao;
  /** Presente quando status !== 'novo'. */
  senha?: string;
  /** Id de AdesaoStep em que a adesão parou, para retomar o wizard (status 'em_andamento'). */
  etapaAtual?: string;
  /** Dados da solicitação já enviada, exibidos em Acompanhamento (status 'concluida', 'aprovada' ou 'negada'). */
  dataSolicitacao?: string;
  numeroProtocolo?: string;
  /** Motivo informado pela entidade, exibido apenas quando status === 'negada'. */
  motivoRecusa?: string;
}

/**
 * Base mock de participantes usada para simular a verificação de CPF no início
 * da adesão. Para adicionar um novo cenário de teste, basta incluir um novo
 * objeto neste array.
 */
export const PARTICIPANTES_MOCK: ParticipanteMock[] = [
  {
    cpf: '22222222222',
    nome: 'Maria Oliveira',
    status: 'em_andamento',
    senha: '123456',
    etapaAtual: 'dados-pessoais',
  },
  {
    cpf: '33333333333',
    nome: 'Carlos Souza',
    status: 'concluida',
    senha: '123456',
    dataSolicitacao: '03/07/2026',
    numeroProtocolo: 'PREV-2026-004821',
  },
  {
    cpf: '44444444444',
    nome: 'Ana Beatriz Lima',
    status: 'negada',
    senha: '123456',
    dataSolicitacao: '28/06/2026',
    numeroProtocolo: 'PREV-2026-004512',
    motivoRecusa: 'Não foi possível confirmar o vínculo empregatício informado com a empresa patrocinadora do plano.',
  },
  {
    cpf: '55555555555',
    nome: 'Pedro Almeida',
    status: 'aprovada',
    senha: '123456',
    dataSolicitacao: '15/06/2026',
    numeroProtocolo: 'PREV-2026-004203',
  },
];
