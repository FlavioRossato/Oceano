export interface PessoaNavegaMock {
  /** Somente dígitos. */
  cpf: string;
  nome: string;
  dataNascimento: string;
  sexo: 'feminino' | 'masculino';
  escolaridade: string;
  estadoCivil: string;
  telefone: string;
  email: string;
}

/**
 * Simula a base de pessoas do Navega, consultada pelo CPF antes de liberar os
 * dados cadastrais de cada representante (RN14-16). Qualquer CPF válido fora
 * desta lista é tratado como "não encontrado" (ex.: 246.813.579-28).
 */
export const PESSOAS_NAVEGA_MOCK: PessoaNavegaMock[] = [
  {
    cpf: '12345678909',
    nome: 'Mariana Souza Andrade',
    dataNascimento: '14/03/1985',
    sexo: 'feminino',
    escolaridade: 'superior-completo',
    estadoCivil: 'casado',
    telefone: '(11) 98765-4321',
    email: 'mariana.andrade@email.com.br',
  },
  {
    cpf: '98765432100',
    nome: 'Roberto Carlos Andrade',
    dataNascimento: '02/09/1981',
    sexo: 'masculino',
    escolaridade: 'medio-completo',
    estadoCivil: 'casado',
    telefone: '',
    email: '',
  },
  {
    // Menor de idade na base — a busca encontra, mas a RN12 bloqueia o avanço (RN18).
    cpf: '11144477735',
    nome: 'Lucas Souza Andrade',
    dataNascimento: '21/05/2012',
    sexo: 'masculino',
    escolaridade: 'fundamental-incompleto',
    estadoCivil: 'solteiro',
    telefone: '',
    email: '',
  },
];
