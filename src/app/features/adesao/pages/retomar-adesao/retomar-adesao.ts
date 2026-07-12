import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LemeButtonComponent } from 'leme';
import { PasswordFieldComponent } from '../../../../shared/components/password-field/password-field';
import { ParticipanteMockService } from '../../services/participante-mock.service';

@Component({
  selector: 'app-retomar-adesao',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PasswordFieldComponent, LemeButtonComponent],
  templateUrl: './retomar-adesao.html',
  styleUrl: './retomar-adesao.scss',
})
export class RetomarAdesao {
  private readonly participanteMock = inject(ParticipanteMockService);
  private readonly router = inject(Router);

  readonly senha = signal('');
  readonly senhaInvalida = signal(false);

  private readonly participante = computed(() => {
    const cpf = this.participanteMock.cpfEmVerificacao();
    return cpf ? this.participanteMock.buscarPorCpf(cpf) : undefined;
  });

  /**
   * Não revela o status da solicitação antes da autenticação — a diferença
   * entre "em andamento", "concluída" e "negada" só aparece após a senha.
   */
  readonly saudacao = computed(() =>
    this.participante()?.status === 'em_andamento'
      ? 'Vamos continuar de onde você parou para finalizar sua adesão ao plano de previdência.'
      : 'Informe sua senha de acesso para consultar o status da sua solicitação.'
  );

  onSenhaChange(value: string): void {
    this.senha.set(value);
    this.senhaInvalida.set(false);
  }

  entrar(): void {
    const cpf = this.participanteMock.cpfEmVerificacao();
    if (!cpf) return;

    if (!this.participanteMock.validarSenha(cpf, this.senha())) {
      this.senhaInvalida.set(true);
      return;
    }

    const participante = this.participante();
    if (participante?.status === 'em_andamento') {
      this.router.navigate([`/adesao/${participante.etapaAtual ?? 'vinculo'}`]);
      return;
    }

    this.router.navigate(['/adesao/acompanhamento']);
  }

  esqueciSenha(): void {
    this.router.navigate(['/adesao/recuperar-senha']);
  }
}
