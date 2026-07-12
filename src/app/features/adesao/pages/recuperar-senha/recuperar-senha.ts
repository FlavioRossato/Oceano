import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LemeButtonComponent } from 'leme';
import { PasswordFieldComponent } from '../../../../shared/components/password-field/password-field';
import { ParticipanteMockService } from '../../services/participante-mock.service';

@Component({
  selector: 'app-recuperar-senha',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PasswordFieldComponent, LemeButtonComponent],
  templateUrl: './recuperar-senha.html',
  styleUrl: './recuperar-senha.scss',
})
export class RecuperarSenha {
  private readonly participanteMock = inject(ParticipanteMockService);
  private readonly router = inject(Router);

  readonly novaSenha = signal('');
  readonly confirmarSenha = signal('');
  readonly erro = signal('');

  redefinir(): void {
    const cpf = this.participanteMock.cpfEmVerificacao();
    if (!cpf) return;

    if (!this.novaSenha() || !this.confirmarSenha()) {
      this.erro.set('Preencha os dois campos.');
      return;
    }

    if (this.novaSenha() !== this.confirmarSenha()) {
      this.erro.set('As senhas não coincidem.');
      return;
    }

    this.participanteMock.redefinirSenha(cpf, this.novaSenha());
    this.router.navigate(['/adesao/retomar-adesao']);
  }

  voltarParaLogin(): void {
    this.router.navigate(['/adesao/retomar-adesao']);
  }
}
