import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LemeTextFieldComponent } from 'leme';
import { formatCpfInput, onlyDigits } from '../../../../shared/utils/cpf-format.util';
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
    const formatted = formatCpfInput(value);
    this.cpf.set(formatted);
    this.adesao.setCanContinue(onlyDigits(formatted).length === 11);
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

    if (!participante || participante.status === 'novo') {
      this.router.navigate(['/adesao/senha-acesso']);
      return;
    }

    // Toda adesão já iniciada (em andamento, concluída ou negada) exige senha
    // antes de mostrar qualquer informação — inclusive o status da solicitação.
    this.participanteMock.cpfEmVerificacao.set(cpf);
    this.router.navigate(['/adesao/retomar-adesao']);
  }
}
