import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LemeTextFieldComponent } from 'leme';
import { formatPhoneInput } from '../../../../shared/utils/phone-format.util';
import { onlyDigits } from '../../../../shared/utils/cpf-format.util';
import { AdesaoDadosService } from '../../services/adesao-dados.service';
import { AdesaoService } from '../../services/adesao.service';

@Component({
  selector: 'app-sobre-voce',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LemeTextFieldComponent],
  templateUrl: './sobre-voce.html',
  styleUrl: './sobre-voce.scss',
})
export class SobreVoce implements OnInit, OnDestroy {
  private readonly adesao = inject(AdesaoService);
  private readonly dados = inject(AdesaoDadosService);

  nomeCompleto = '';
  telefone = '';

  onTelefoneChange(value: string): void {
    this.telefone = formatPhoneInput(value);
    this.atualizarCanContinue();
  }

  onNomeChange(value: string): void {
    this.nomeCompleto = value;
    this.atualizarCanContinue();
  }

  ngOnInit(): void {
    const dadosPessoais = this.dados.dadosPessoais();
    const contato = this.dados.contato();
    this.nomeCompleto = dadosPessoais.nomeCompleto;
    this.telefone = contato.telefone;
    this.atualizarCanContinue();
  }

  ngOnDestroy(): void {
    this.dados.updateDadosPessoais({ nomeCompleto: this.nomeCompleto });
    this.dados.updateContato({ telefone: this.telefone });
    this.adesao.setCanContinue(true);
  }

  private atualizarCanContinue(): void {
    const nomeValido = this.nomeCompleto.trim().length > 3;
    const telefoneValido = onlyDigits(this.telefone).length >= 10;
    this.adesao.setCanContinue(nomeValido && telefoneValido);
  }
}
