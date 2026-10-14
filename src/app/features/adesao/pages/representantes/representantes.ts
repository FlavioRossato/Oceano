import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LemeButtonComponent, LemeMessageComponent, LemeModalComponent, LemeSwitchComponent } from 'leme';
import { MultiFileUpload, UploadedFile } from '@shared/components/multi-file-upload/multi-file-upload';
import { onlyDigits } from '@shared/utils/cpf-format.util';
import { mascararCpf, mascararNome } from '@shared/utils/mascaramento.util';
import {
  RepresentanteBloco,
  RepresentanteErros,
  RepresentanteFields,
  exigeRelacaoLivre,
  validarRepresentante,
} from '../../components/representante-bloco/representante-bloco';
import { RELACOES_MENOR_MOCK } from '../../data/relacoes-menor-mock.data';
import { AdesaoDadosService, representanteVazio } from '../../services/adesao-dados.service';
import { AdesaoService } from '../../services/adesao.service';

function mensagens(erros: RepresentanteErros): string[] {
  return Object.values(erros).filter((m): m is string => !!m);
}

function representanteFieldsVazio(): RepresentanteFields {
  const { documentos: _, ...campos } = representanteVazio();
  return campos;
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
    LemeSwitchComponent,
    MultiFileUpload,
    RepresentanteBloco,
  ],
  templateUrl: './representantes.html',
  styleUrl: './representantes.scss',
})
export class Representantes implements OnInit, OnDestroy {
  private readonly dados = inject(AdesaoDadosService);
  protected readonly adesao = inject(AdesaoService);

  legal: RepresentanteFields = representanteFieldsVazio();
  financeiro: RepresentanteFields = representanteFieldsVazio();

  readonly legalDocumentos = signal<UploadedFile[]>([]);
  readonly financeiroDocumentos = signal<UploadedFile[]>([]);
  readonly autorizacaoDocumentos = signal<UploadedFile[]>([]);

  /** null = pergunta ainda não respondida. */
  readonly mesmaPessoa = signal<boolean | null>(null);
  readonly mostrarConfirmacaoDescarte = signal(false);

  /** Liga o destaque dos campos inválidos — só depois da primeira tentativa de avançar. */
  readonly mostrarErros = signal(false);
  readonly erros = signal<string[]>([]);

  readonly cpfMenor = onlyDigits(this.dados.dadosPessoais().cpf);

  ngOnInit(): void {
    const { documentos: legalDocs, ...legal } = this.dados.representanteLegal();
    this.legal = legal;
    this.legalDocumentos.set(legalDocs.map(name => ({ name, size: 0 })));

    this.mesmaPessoa.set(this.dados.mesmaPessoaRepresentantes());

    // Em "mesma pessoa" o financeiro persistido é só a réplica do legal — não volta para o formulário.
    if (this.mesmaPessoa() !== true) {
      const { documentos: financeiroDocs, ...financeiro } = this.dados.representanteFinanceiro();
      this.financeiro = financeiro;
      this.financeiroDocumentos.set(financeiroDocs.map(name => ({ name, size: 0 })));
    }

    this.adesao.setNextOverride(() => this.avancar());
  }

  ngOnDestroy(): void {
    this.persistir();
    this.adesao.setNextOverride(null);
  }

  relacaoLabel(relacao: string): string {
    return RELACOES_MENOR_MOCK.find(r => r.value === relacao)?.label ?? '';
  }

  /** Réplica somente leitura do legal (RN07) — mantém a máscara quando os dados vieram da base. */
  replicaNome(): string {
    return this.legal.origemCadastro === 'navega' ? mascararNome(this.legal.nome) : this.legal.nome;
  }

  replicaCpf(): string {
    return this.legal.origemCadastro === 'navega' ? mascararCpf(this.legal.cpf) : this.legal.cpf;
  }

  exigeAutorizacao(): boolean {
    return this.mesmaPessoa() === false && exigeRelacaoLivre(this.financeiro.relacaoComMenor);
  }

  onMesmaPessoaChange(value: boolean): void {
    const anterior = this.mesmaPessoa();

    // RN08: trocar de "não" para "sim" com dados do financeiro já preenchidos exige confirmação antes de descartar.
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

  /**
   * RN08: qualquer troca de resposta zera o bloco financeiro — de "sim" para
   * "não" porque os dados eram só a réplica do legal; de "não" para "sim"
   * porque o usuário já confirmou o descarte.
   */
  private aplicarMesmaPessoa(value: boolean): void {
    this.mesmaPessoa.set(value);
    this.dados.setMesmaPessoaRepresentantes(value);
    this.financeiro = representanteFieldsVazio();
    this.financeiroDocumentos.set([]);
    this.autorizacaoDocumentos.set([]);
  }

  private temDadosFinanceiroPreenchidos(): boolean {
    return !!(this.financeiro.cpf || this.financeiro.nome || this.financeiroDocumentos().length);
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
   * RN05-13: valida os dois papéis antes de avançar. CPFs iguais com resposta
   * "não" não geram erro (RN11) — viram um único cadastro nos dois papéis.
   */
  private avancar(): void {
    const erros: string[] = [];

    erros.push(...mensagens(validarRepresentante(this.legal, this.legalDocumentos(), this.cpfMenor, 'representante legal')));

    if (this.mesmaPessoa() === null) {
      erros.push('Informe se o representante financeiro é a mesma pessoa do representante legal.');
    } else if (this.mesmaPessoa() === false) {
      erros.push(
        ...mensagens(validarRepresentante(this.financeiro, this.financeiroDocumentos(), this.cpfMenor, 'representante financeiro')),
      );

      if (this.exigeAutorizacao() && !this.autorizacaoDocumentos().length) {
        erros.push('Envie a autorização do representante legal para o representante financeiro.');
      }
    }

    if (erros.length) {
      this.mostrarErros.set(true);
      this.erros.set(erros);
      return;
    }

    this.mostrarErros.set(false);
    this.erros.set([]);
    this.persistir();
    // Contato do titular menor passa a ser o do representante legal — pré-preenchido, ainda editável em Contato & endereço.
    this.dados.updateContato({ telefone: this.legal.telefone, email: this.legal.email });
    this.adesao.setNextOverride(null);
    this.adesao.next();
  }
}
