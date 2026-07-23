import { Injectable, signal } from '@angular/core';
import { PlanoAdesao } from '../models/plano-adesao.model';

const PLANO_PADRAO: Pick<PlanoAdesao, 'id' | 'nome' | 'logo' | 'logoFundo'> = {
  id: 'visao-multi',
  nome: 'Visão Multi',
  logo: 'visaomulti.svg',
  logoFundo: 'escuro',
};

/**
 * Guarda qual plano o participante escolheu na tela de seleção, para que o
 * restante do fluxo de adesão (logo do painel, textos) reflita esse plano.
 * Quando a adesão é iniciada sem passar pela seleção (ex.: link direto para
 * /adesao/boas-vindas), o plano padrão mantém o comportamento atual do wizard.
 */
@Injectable({ providedIn: 'root' })
export class PlanoSelecionadoService {
  private readonly plano = signal<Pick<PlanoAdesao, 'id' | 'nome' | 'logo' | 'logoFundo'>>(PLANO_PADRAO);

  readonly atual = this.plano.asReadonly();

  selecionar(plano: PlanoAdesao): void {
    this.plano.set({ id: plano.id, nome: plano.nome, logo: plano.logo, logoFundo: plano.logoFundo });
  }
}
