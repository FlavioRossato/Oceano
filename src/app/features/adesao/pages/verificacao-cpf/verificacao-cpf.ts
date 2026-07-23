import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LemeTextFieldComponent } from 'leme';
import { onlyDigits } from '../../../../shared/utils/cpf-format.util';
import { AdesaoService } from '../../services/adesao.service';
import { ParticipanteMockService } from '../../services/participante-mock.service';

@Component({
  selector: 'app-verificacao-cpf',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LemeTextFieldComponent],
  templateUrl: './verificacao-cpf.html',
  styleUrl: './verificacao-cpf.scss',
})
export class VerificacaoCpf implements OnInit, OnDestroy {
  private readonly adesao = inject(AdesaoService);
  private readonly participanteMock = inject(ParticipanteMockService);
  private readonly router = inject(Router);

  readonly cpf = signal('');

  onCpfChange(value: string): void {
    this.cpf.set(value);
    this.adesao.setCanContinue(onlyDigits(value).length === 11);
  }

  ngOnInit(): void {
    this.adesao.setCanContinue(false);
    this.adesao.setBackOverride(() => this.router.navigate(['/adesao/boas-vindas']));
    this.adesao.setNextOverride(() => this.verificar());
  }

  ngOnDestroy(): void {
    this.adesao.setCanContinue(true);
    this.adesao.setBackOverride(null);
    this.adesao.setNextOverride(null);
  }

  private verificar(): void {
    const cpf = onlyDigits(this.cpf());
    const participante = this.participanteMock.buscarPorCpf(cpf);

    // Toda adesão já iniciada (em andamento, concluída ou negada) exige senha
    // antes de mostrar qualquer informação — inclusive o status da solicitação.
    // Só depende do CPF: quem já tem cadastro nunca vê o campo de e-mail.
    if (participante && participante.status !== 'novo') {
      this.participanteMock.cpfEmVerificacao.set(cpf);
      this.router.navigate(['/adesao/retomar-adesao']);
      return;
    }

    // Participante novo (ou sem cadastro): o e-mail só é pedido na próxima
    // etapa, já que é o único caminho que precisa dele.
    this.router.navigate(['/adesao/verificacao-email']);
  }
}
