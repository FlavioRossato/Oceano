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

type Fase = 'cpf' | 'email' | 'codigo';

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

  // Etapa única: CPF primeiro; só quando o CPF é de participante novo é que
  // o e-mail (e, na sequência, o código) passam a ser pedidos, na mesma tela.
  // Quem já tem cadastro nunca chega a ver o campo de e-mail (verificarCpf()).
  readonly fase = signal<Fase>('cpf');

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
    this.adesao.setCanContinue(onlyDigits(value).length === 11);
  }

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
    if (this.fase() === 'cpf') {
      this.verificarCpf();
      return;
    }
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

    // fase 'email': volta a pedir o CPF, na mesma tela — dali em diante o
    // botão Voltar assume de novo o comportamento padrão do wizard.
    this.fase.set('cpf');
    this.email.set('');
    this.emailInvalido.set(false);
    this.adesao.setCanContinue(onlyDigits(this.cpf()).length === 11);
    this.adesao.setBackOverride(null);
  }

  private verificarCpf(): void {
    const cpf = onlyDigits(this.cpf());
    const plano = this.dados.planoSelecionado();

    if (plano?.tipo === 'patrocinado' && !this.participanteMock.verificarElegibilidadePatrocinado(cpf, plano.id)) {
      this.semVinculoPatrocinadora.set(true);
      return;
    }

    const participante = this.participanteMock.buscarPorCpf(cpf);

    // Toda adesão já iniciada (em andamento, concluída ou negada) exige senha
    // antes de mostrar qualquer informação — inclusive o status da solicitação.
    // Só depende do CPF: quem já tem cadastro nunca vê o campo de e-mail.
    if (participante && participante.status !== 'novo') {
      this.participanteMock.cpfEmVerificacao.set(cpf);
      this.router.navigate(['/adesao/retomar-adesao']);
      return;
    }

    // Participante novo (ou sem cadastro): o e-mail passa a ser pedido agora,
    // na mesma tela.
    this.fase.set('email');
    this.adesao.setCanContinue(isValidEmail(this.email()));
    this.adesao.setBackOverride(() => this.voltar());
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
