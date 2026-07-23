import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LemeTextFieldComponent } from 'leme';
import { onlyDigits } from '../../../../shared/utils/cpf-format.util';
import { isValidEmail } from '../../../../shared/utils/email-validate.util';
import { AdesaoDadosService } from '../../services/adesao-dados.service';
import { AdesaoService } from '../../services/adesao.service';
import { ParticipanteMockService } from '../../services/participante-mock.service';

const REENVIO_COOLDOWN_SEGUNDOS = 30;

type Fase = 'email' | 'codigo';

@Component({
  selector: 'app-verificacao-email',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LemeTextFieldComponent],
  templateUrl: './verificacao-email.html',
  styleUrl: './verificacao-email.scss',
})
export class VerificacaoEmail implements OnInit, OnDestroy {
  private readonly adesao = inject(AdesaoService);
  private readonly dados = inject(AdesaoDadosService);
  private readonly participanteMock = inject(ParticipanteMockService);
  private readonly router = inject(Router);

  private cooldownIntervalId?: ReturnType<typeof setInterval>;

  // Chegamos aqui só depois de confirmar, pelo CPF, que não há solicitação
  // em andamento — por isso o e-mail é pedido nesta etapa, não na de CPF.
  readonly fase = signal<Fase>('email');

  readonly email = signal('');
  readonly emailInvalido = signal(false);

  readonly codigo = signal('');
  readonly codigoInvalido = signal(false);
  readonly reenviarCooldown = signal(0);

  readonly podeReenviar = computed(() => this.reenviarCooldown() === 0);

  onEmailChange(value: string): void {
    this.email.set(value);
    this.emailInvalido.set(false);
    this.adesao.setCanContinue(isValidEmail(value));
  }

  onCodigoChange(value: string): void {
    const digits = onlyDigits(value).slice(0, 6);
    this.codigo.set(digits);
    this.codigoInvalido.set(false);
    this.adesao.setCanContinue(digits.length === 6);
  }

  reenviarCodigo(): void {
    if (!this.podeReenviar()) return;

    // Mock: não há envio real de e-mail; apenas reinicia o prazo de reenvio.
    this.codigoInvalido.set(false);
    this.iniciarCooldown();
  }

  ngOnInit(): void {
    this.fase.set('email');
    this.adesao.setCanContinue(false);
    this.adesao.setBackOverride(() => this.voltar());
    this.adesao.setNextOverride(() => this.continuar());
  }

  ngOnDestroy(): void {
    this.adesao.setCanContinue(true);
    this.adesao.setBackOverride(null);
    this.adesao.setNextOverride(null);
    if (this.cooldownIntervalId) clearInterval(this.cooldownIntervalId);
  }

  private continuar(): void {
    if (this.fase() === 'email') {
      this.enviarCodigo();
      return;
    }
    this.confirmarCodigo();
  }

  private voltar(): void {
    if (this.fase() === 'codigo') {
      // Volta para poder corrigir o e-mail, sem sair da etapa.
      this.fase.set('email');
      this.codigo.set('');
      this.codigoInvalido.set(false);
      if (this.cooldownIntervalId) clearInterval(this.cooldownIntervalId);
      this.reenviarCooldown.set(0);
      this.adesao.setCanContinue(isValidEmail(this.email()));
      return;
    }

    this.router.navigate(['/adesao/verificacao-cpf']);
  }

  private enviarCodigo(): void {
    if (!isValidEmail(this.email())) {
      this.emailInvalido.set(true);
      return;
    }

    // O e-mail confirmado já fica disponível para o restante do formulário —
    // assim ninguém precisa digitá-lo de novo em Contato & endereço.
    this.dados.updateContato({ email: this.email() });
    this.participanteMock.emailEmVerificacao.set(this.email());

    // Mock: não há envio real de e-mail; o código é sempre o mesmo.
    this.fase.set('codigo');
    this.adesao.setCanContinue(false);
    this.iniciarCooldown();
  }

  private confirmarCodigo(): void {
    if (!this.participanteMock.validarCodigoEmail(this.codigo())) {
      this.codigoInvalido.set(true);
      return;
    }

    this.router.navigate(['/adesao/senha-acesso']);
  }

  private iniciarCooldown(): void {
    if (this.cooldownIntervalId) clearInterval(this.cooldownIntervalId);
    this.reenviarCooldown.set(REENVIO_COOLDOWN_SEGUNDOS);
    this.cooldownIntervalId = setInterval(() => {
      this.reenviarCooldown.update(v => {
        if (v <= 1) {
          clearInterval(this.cooldownIntervalId);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  }
}
