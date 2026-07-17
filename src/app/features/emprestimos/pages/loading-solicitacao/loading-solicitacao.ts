import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';

type EtapaStatus = 'concluida' | 'atual' | 'pendente';

interface Etapa {
  titulo: string;
  descricao: string;
  icone: string;
}

// Este loading acontece quando o participante já logado clica para entrar na
// área de Empréstimos do Portal — não há solicitação em andamento ainda. Ao
// final, ele verá o valor disponível para contratação e, se houver, os
// contratos que já possui. Cada item abaixo corresponde a um status
// reportado pelo backend, traduzido para uma linguagem que faz sentido para
// o participante:
//   PENDING / STARTED             -> "Acessando sua área de empréstimos"
//   LIMIT_VALIDATED (Navega)      -> "Consultando as condições disponíveis"
//   THIRD_PARTY_VALIDATED (Zetra) -> "Verificando seus contratos"
//   MARGIN_VALIDATED              -> "Calculando o valor disponível"
// COMPLETED é status sistêmico e não aparece na lista — nele o participante
// segue automaticamente para a tela de empréstimos.
const ETAPAS: Etapa[] = [
  {
    titulo: 'Acessando sua área de empréstimos',
    descricao: 'Estamos buscando as informações mais recentes para você.',
    icone: 'manage_search',
  },
  {
    titulo: 'Consultando as condições disponíveis',
    descricao: 'Estamos verificando as regras e limites aplicáveis ao seu plano.',
    icone: 'fact_check',
  },
  {
    titulo: 'Verificando seus contratos',
    descricao: 'Estamos conferindo se você já possui contratos de empréstimo ativos.',
    icone: 'description',
  },
  {
    titulo: 'Calculando o valor disponível',
    descricao: 'Estamos calculando quanto você pode contratar agora.',
    icone: 'payments',
  },
];

const DURACAO_ETAPA_MS = 2200;

@Component({
  selector: 'app-loading-solicitacao',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loading-solicitacao.html',
  styleUrl: './loading-solicitacao.scss',
})
export class LoadingSolicitacao {
  private readonly destroyRef = inject(DestroyRef);
  private timeoutId?: ReturnType<typeof setTimeout>;

  readonly etapas = ETAPAS;
  readonly indiceAtual = signal(0);
  readonly concluido = signal(false);

  constructor() {
    // Esta página é isolada para validação visual (ver Diretrizes.md) e ainda
    // não recebe status reais do backend. A simulação abaixo apenas percorre
    // as etapas em loop para permitir revisar todos os estados visuais.
    afterNextRender(() => this.agendarProximaEtapa());
    this.destroyRef.onDestroy(() => clearTimeout(this.timeoutId));
  }

  statusDaEtapa(indice: number): EtapaStatus {
    if (this.concluido() || indice < this.indiceAtual()) return 'concluida';
    if (indice === this.indiceAtual()) return 'atual';
    return 'pendente';
  }

  private agendarProximaEtapa(): void {
    this.timeoutId = setTimeout(() => {
      if (this.concluido()) {
        this.concluido.set(false);
        this.indiceAtual.set(0);
      } else {
        const proximo = this.indiceAtual() + 1;
        if (proximo >= this.etapas.length) {
          this.concluido.set(true);
        } else {
          this.indiceAtual.set(proximo);
        }
      }
      this.agendarProximaEtapa();
    }, DURACAO_ETAPA_MS);
  }
}
