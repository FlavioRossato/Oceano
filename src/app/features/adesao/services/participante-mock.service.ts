import { Injectable, signal } from '@angular/core';
import { ParticipanteMock, PARTICIPANTES_MOCK } from '../data/participantes-mock.data';

/**
 * Simula a consulta de cadastro por CPF no início da adesão. Toda a "base"
 * vive em memória (PARTICIPANTES_MOCK) — não há integração real.
 */
@Injectable({ providedIn: 'root' })
export class ParticipanteMockService {
  private readonly participantes = signal<ParticipanteMock[]>(PARTICIPANTES_MOCK);

  /** CPF (somente dígitos) sob verificação entre as telas de CPF, retomada e recuperação de senha. */
  readonly cpfEmVerificacao = signal<string | null>(null);

  /** E-mail informado na verificação de CPF, aguardando confirmação por código (novos participantes). */
  readonly emailEmVerificacao = signal<string | null>(null);

  /** Código fixo simulando o token enviado por e-mail — não há envio real neste protótipo. */
  private readonly codigoEmailMock = '123456';

  buscarPorCpf(cpf: string): ParticipanteMock | undefined {
    return this.participantes().find(p => p.cpf === cpf);
  }

  validarCodigoEmail(codigo: string): boolean {
    return codigo === this.codigoEmailMock;
  }

  validarSenha(cpf: string, senha: string): boolean {
    return this.buscarPorCpf(cpf)?.senha === senha;
  }

  redefinirSenha(cpf: string, novaSenha: string): void {
    this.participantes.update(lista =>
      lista.map(p => (p.cpf === cpf ? { ...p, senha: novaSenha } : p)),
    );
  }
}
