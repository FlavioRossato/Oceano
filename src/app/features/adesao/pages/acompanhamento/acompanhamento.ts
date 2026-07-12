import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LemeButtonComponent } from 'leme';
import { ParticipanteMockService } from '../../services/participante-mock.service';

@Component({
  selector: 'app-acompanhamento',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LemeButtonComponent],
  templateUrl: './acompanhamento.html',
  styleUrl: './acompanhamento.scss',
})
export class Acompanhamento {
  private readonly router = inject(Router);
  private readonly participanteMock = inject(ParticipanteMockService);

  readonly participante = computed(() => {
    const cpf = this.participanteMock.cpfEmVerificacao();
    return cpf ? this.participanteMock.buscarPorCpf(cpf) : undefined;
  });

  readonly negada = computed(() => this.participante()?.status === 'negada');
  readonly aprovada = computed(() => this.participante()?.status === 'aprovada');

  readonly icone = computed(() => {
    if (this.negada()) return 'cancel';
    if (this.aprovada()) return 'check_circle';
    return 'hourglass_top';
  });

  readonly tagLabel = computed(() => {
    if (this.negada()) return 'Solicitação negada';
    if (this.aprovada()) return 'Aprovada';
    return 'Em análise';
  });

  readonly titulo = computed(() => {
    if (this.negada()) return 'Sua solicitação não foi aprovada';
    if (this.aprovada()) return 'Sua solicitação foi aprovada!';
    return 'Recebemos sua solicitação!';
  });

  readonly descricao = computed(() => {
    if (this.negada()) {
      return 'Recebemos o pedido de adesão ao plano Visão Multi e, após analisar suas informações, não foi possível aprovar a sua solicitação.';
    }
    if (this.aprovada()) {
      return 'Recebemos o pedido de adesão ao plano Visão Multi e sua solicitação foi aprovada.';
    }
    return 'Recebemos o pedido de adesão ao plano Visão Multi e já iniciamos a análise das suas informações.';
  });

  readonly proximosPassos = computed(() => {
    if (this.negada()) {
      return 'Se tiver dúvidas sobre esse resultado ou quiser saber mais sobre as opções disponíveis, entre em contato com a entidade pelos canais de atendimento.';
    }
    if (this.aprovada()) {
      return 'A entidade entrará em contato pelos meios de contato informados para explicar os próximos passos de acesso ao portal do participante.';
    }
    return 'Analisamos cuidadosamente todas as informações da sua solicitação. Assim que a análise é concluída, entramos em contato pelos meios informados na sua adesão, e você também pode acompanhar a novidade por aqui.';
  });

  voltarInicio(): void {
    this.router.navigate(['/adesao/boas-vindas']);
  }

  // TODO: gerar o PDF com o resumo completo da adesão (todas as etapas preenchidas).
  baixarResumo(): void {}
}
