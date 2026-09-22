import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LemeTextFieldComponent, LemeMessageComponent } from 'leme';
import { onlyDigits } from '../../../../shared/utils/cpf-format.util';
import { isValidEmail } from '../../../../shared/utils/email-validate.util';
import { AdesaoDadosService } from '../../services/adesao-dados.service';
import { AdesaoService } from '../../services/adesao.service';
import { ParticipanteMockService } from '../../services/participante-mock.service';

const REENVIO_COOLDOWN_SEGUNDOS = 30;

type Fase = 'dados' | 'codigo';

@Component({
  selector: 'app-verificacao-cpf',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LemeTextFieldComponent, LemeMessageComponent],
  templateUrl: './verificacao-cpf.html',
  styleUrl: './verificacao-cpf.scss',
})
export class VerificacaoCpf implements OnInit, OnDestroy {
  private readonly adesao = inject(AdesaoService);
  private readonly dados = inject(AdesaoDadosService);
  private readonly participanteMock = inject(ParticipanteMockService);
  private readonly router = inject(Router);

  private cooldownIntervalId?: ReturnType<typeof setInterval>;

  // CPF e e-mail são pedidos juntos na mesma tela; só quando o CPF é de
  // participante novo é que o código de confirmação passa a ser pedido.
  // Quem já tem cadastro nunca chega a ver o código (verificarDados()).
  readonly fase = signal<Fase>('dados');

  readonly cpf = signal('');
  /** RN07: CPF sem vínculo com a patrocinadora do plano Patrocinado selecionado. */
  readonly semVinculoPatrocinadora = signal(false);

  readonly email = signal('');
  readonly emailInvalido = signal(false);

  readonly codigo = signal('');
  readonly codigoInvalido = signal(false);
  readonly reenviarCooldown = signal(0);

  readonly podeReenviar = computed(() => this.reenviarCooldown() === 0);

  onCpfChange(value: string): void {
    this.cpf.set(value);
    this.semVinculoPatrocinadora.set(false);
    this.atualizarCanContinueDados();
  }

  onEmailChange(value: string): void {
    this.email.set(value);
    this.emailInvalido.set(false);
    this.atualizarCanContinueDados();
  }

  private atualizarCanContinueDados(): void {
    this.adesao.setCanContinue(onlyDigits(this.cpf()).length === 11 && isValidEmail(this.email()));
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
    this.adesao.setCanContinue(false);
    this.adesao.setNextOverride(() => this.avancar());
  }

  ngOnDestroy(): void {
    this.adesao.setCanContinue(true);
    this.adesao.setNextOverride(null);
    this.adesao.setBackOverride(null);
    if (this.cooldownIntervalId) clearInterval(this.cooldownIntervalId);
  }

  voltarParaSelecaoPlano(): void {
    this.router.navigate(['/adesao/selecao-plano']);
  }

  jaTemConta(): void {
    const cpf = onlyDigits(this.cpf());
    if (cpf.length === 11) this.participanteMock.cpfEmVerificacao.set(cpf);
    this.router.navigate(['/adesao/retomar-adesao']);
  }

  private avancar(): void {
    if (this.fase() === 'dados') {
      this.verificarDados();
      return;
    }
    this.confirmarCodigo();
  }

  private voltar(): void {
    // Volta para poder corrigir o CPF ou o e-mail, sem sair da etapa —
    // dali em diante o botão Voltar assume de novo o comportamento padrão do wizard.
    this.fase.set('dados');
    this.codigo.set('');
    this.codigoInvalido.set(false);
    if (this.cooldownIntervalId) clearInterval(this.cooldownIntervalId);
    this.reenviarCooldown.set(0);
    this.atualizarCanContinueDados();
    this.adesao.setBackOverride(null);
  }

  private verificarDados(): void {
    const cpf = onlyDigits(this.cpf());
    const plano = this.dados.planoSelecionado();

    if (plano?.tipo === 'patrocinado' && !this.participanteMock.verificarElegibilidadePatrocinado(cpf, plano.id)) {
      this.semVinculoPatrocinadora.set(true);
      return;
    }

    const participante = this.participanteMock.buscarPorCpf(cpf);

    // Toda adesão já iniciada (em andamento, concluída ou negada) exige senha
    // antes de mostrar qualquer informação — inclusive o status da solicitação.
    // Só depende do CPF: quem já tem cadastro nunca vê o código de confirmação.
    if (participante && participante.status !== 'novo') {
      this.participanteMock.cpfEmVerificacao.set(cpf);
      this.router.navigate(['/adesao/retomar-adesao']);
      return;
    }

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
    this.adesao.setBackOverride(() => this.voltar());
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
