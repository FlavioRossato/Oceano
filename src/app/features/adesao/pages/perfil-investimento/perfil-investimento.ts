import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { LemeRadioComponent, LemeCheckboxComponent } from 'leme';
import { AdesaoService } from '../../services/adesao.service';
import { AdesaoDadosService } from '../../services/adesao-dados.service';

type SubStep = 'intro' | 1 | 2 | 3 | 4 | 5 | 6 | 'resultado';

interface Opcao {
  value: string;
  label: string;
}

interface Pergunta {
  numero: 1 | 2 | 3 | 4 | 5 | 6;
  texto: string;
  multipla: boolean;
  opcoes: Opcao[];
}

const PERGUNTAS: Pergunta[] = [
  {
    numero: 1,
    texto: 'Qual o seu pensamento na hora de investir?',
    multipla: false,
    opcoes: [
      { value: 'seguranca', label: 'Busco primeiro segurança, mesmo que para isso eu precise abrir mão de rendimentos maiores.' },
      { value: 'equilibrio', label: 'Prefiro opções que equilibrem melhor o risco retorno.' },
      { value: 'rendimento', label: 'Priorizo o rendimento mais alto, ainda que isso represente mais risco para minha carteira de investimentos.' },
    ],
  },
  {
    numero: 2,
    texto: 'O que é mais importante para você na hora de investir?',
    multipla: false,
    opcoes: [
      { value: 'rentabilidade', label: 'Rentabilidade e diversificação.' },
      { value: 'seguranca', label: 'Segurança e tranquilidade.' },
    ],
  },
  {
    numero: 3,
    texto: 'Como você classificaria seu nível de conhecimento sobre investimentos?',
    multipla: false,
    opcoes: [
      { value: 'nenhuma', label: 'Nenhuma.' },
      { value: 'basico', label: 'Básico: Conheço o mercado de renda fixa e fundos.' },
      { value: 'intermediario-investimentos', label: 'Intermediário: Entendo algo sobre o mercado de renda variável e de investimentos.' },
      { value: 'intermediario-derivativos', label: 'Intermediário: Entendo algo sobre o mercado de renda variável e de derivativos.' },
      { value: 'avancado', label: 'Avançado: Sou experiente no mercado de renda variável e de derivativos.' },
    ],
  },
  {
    numero: 4,
    texto: 'Se algo inesperado acontecer e isso fizer seus investimentos se desvalorizarem, o que você faria?',
    multipla: false,
    opcoes: [
      { value: 'venderia', label: 'Venderia imediatamente, não quero me expor ao risco de ativos muito inconstantes no curto prazo.' },
      { value: 'risco-parcial', label: 'Entendo que corro este risco para determinados ativos, mas não para todo o meu patrimônio.' },
      { value: 'risco-total', label: 'Entendo que meu patrimônio está sujeito a flutuações dessa magnitude e não estão 100% protegidos.' },
    ],
  },
  {
    numero: 5,
    texto: 'Por quanto tempo pretende deixar seu dinheiro investido na Entidade?',
    multipla: false,
    opcoes: [
      { value: 'menos-1', label: 'Menos de 1 ano.' },
      { value: '1-a-3', label: 'De 1 a 3 anos.' },
      { value: '3-a-5', label: 'De 3 a 5 anos.' },
      { value: 'mais-5', label: 'Mais de 5 anos' },
    ],
  },
  {
    numero: 6,
    texto: 'Quais investimentos você já fez?',
    multipla: true,
    opcoes: [
      { value: 'nunca', label: 'Nunca investi.' },
      { value: 'poupanca', label: 'Poupança.' },
      { value: 'previdencia', label: 'Previdência Privada.' },
      { value: 'renda-fixa', label: 'Títulos de renda fixa.' },
      { value: 'fundos', label: 'Fundos de investimentos.' },
      { value: 'bolsa', label: 'Bolsa de valores' },
    ],
  },
];

const PERFIS: Record<string, { label: string; descricao: string; alerta: string }> = {
  conservador: {
    label: 'Conservador',
    descricao:
      'Tem como objetivo a maior rentabilidade possível, para isso está disposto a assumir maiores riscos. Conhece os produtos de investimento e suporta as oscilações de mercado.',
    alerta: 'Para o perfil conservador nossas aplicações se baseiam em ações e fundos multimercados.',
  },
  moderado: {
    label: 'Moderado',
    descricao:
      'Tem como objetivo a maior rentabilidade possível, para isso está disposto a assumir maiores riscos. Conhece os produtos de investimento e suporta as oscilações de mercado.',
    alerta: 'Para o perfil moderado nossas aplicações se baseiam em ações e fundos multimercados.',
  },
  arrojado: {
    label: 'Arrojado',
    descricao:
      'Tem como objetivo a maior rentabilidade possível, para isso está disposto a assumir maiores riscos. Conhece os produtos de investimento e suporta as oscilações de mercado.',
    alerta: 'Para o perfil arrojado nossas aplicações se baseiam em ações e fundos multimercados.',
  },
};

@Component({
  selector: 'app-perfil-investimento',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LemeRadioComponent, LemeCheckboxComponent],
  templateUrl: './perfil-investimento.html',
  styleUrl: './perfil-investimento.scss',
})
export class PerfilInvestimento implements OnInit, OnDestroy {
  private readonly adesao = inject(AdesaoService);
  private readonly dados = inject(AdesaoDadosService);

  readonly perguntas = PERGUNTAS;
  readonly perfis = PERFIS;
  readonly perfisAlternativos = ['moderado', 'arrojado'];

  readonly subStep = signal<SubStep>('intro');
  readonly respostas = signal<Record<number, string | string[]>>({});
  readonly perfilIndicado = signal('conservador');
  readonly perfilEscolhido = signal('conservador');
  readonly seguirIndicado = signal(true);
  readonly mostrarOutrasOpcoes = signal(false);

  readonly perguntaAtual = computed(() => {
    const s = this.subStep();
    return typeof s === 'number' ? this.perguntas[s - 1] : null;
  });

  readonly progressoPercentual = computed(() => {
    const s = this.subStep();
    return typeof s === 'number' ? (s / this.perguntas.length) * 100 : 0;
  });

  readonly podeContinuar = computed(() => {
    const s = this.subStep();
    if (s === 'intro' || s === 'resultado') return true;
    const resposta = this.respostas()[s];
    return Array.isArray(resposta) ? resposta.length > 0 : !!resposta;
  });

  constructor() {
    effect(() => this.adesao.setCanContinue(this.podeContinuar()), { allowSignalWrites: true });
    this.adesao.setNextOverride(() => this.handleNext());
    this.adesao.setBackOverride(() => this.handleBack());
  }

  ngOnInit(): void {
    const atual = this.dados.perfilInvestimento();
    this.respostas.set(atual.respostas);
    this.perfilIndicado.set(atual.perfilIndicado);
    this.perfilEscolhido.set(atual.perfilEscolhido);
    this.seguirIndicado.set(atual.perfilEscolhido === atual.perfilIndicado);
  }

  selecionarUnica(numero: number, valor: string): void {
    this.respostas.update(r => ({ ...r, [numero]: valor }));
  }

  toggleMultipla(numero: number, valor: string, marcado: boolean): void {
    this.respostas.update(r => {
      const atuais = (r[numero] as string[] | undefined) ?? [];
      const novos = marcado ? [...atuais, valor] : atuais.filter(v => v !== valor);
      return { ...r, [numero]: novos };
    });
  }

  isSelecionada(numero: number, valor: string): boolean {
    const resposta = this.respostas()[numero];
    return Array.isArray(resposta) ? resposta.includes(valor) : resposta === valor;
  }

  escolherPerfilIndicado(): void {
    this.seguirIndicado.set(true);
    this.perfilEscolhido.set(this.perfilIndicado());
  }

  escolherPerfilAlternativo(perfil: string): void {
    this.seguirIndicado.set(false);
    this.perfilEscolhido.set(perfil);
  }

  private handleNext(): void {
    const s = this.subStep();
    if (s === 'intro') {
      this.subStep.set(1);
      return;
    }
    if (typeof s === 'number') {
      if (s < this.perguntas.length) {
        this.subStep.set((s + 1) as SubStep);
        return;
      }
      this.subStep.set('resultado');
      return;
    }
    // resultado confirmado — sai do sub-wizard e avança de rota de fato
    this.persistir();
    this.adesao.setNextOverride(null);
    this.adesao.setBackOverride(null);
    this.adesao.next();
  }

  private handleBack(): void {
    const s = this.subStep();
    if (s === 'resultado') {
      this.subStep.set(this.perguntas.length as SubStep);
      return;
    }
    if (typeof s === 'number') {
      if (s > 1) {
        this.subStep.set((s - 1) as SubStep);
        return;
      }
      this.subStep.set('intro');
      return;
    }
    // intro — sai do sub-wizard e volta de rota de fato
    this.adesao.setNextOverride(null);
    this.adesao.setBackOverride(null);
    this.adesao.back();
  }

  private persistir(): void {
    this.dados.updatePerfilInvestimento({
      respostas: this.respostas(),
      perfilIndicado: this.perfilIndicado(),
      perfilEscolhido: this.perfilEscolhido(),
      confirmado: true,
    });
  }

  ngOnDestroy(): void {
    this.adesao.setNextOverride(null);
    this.adesao.setBackOverride(null);
    this.adesao.setCanContinue(true);
  }
}
