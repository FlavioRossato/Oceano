import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LemeTextFieldComponent, LemeSelectComponent } from 'leme';

@Component({
  selector: 'app-dados-pessoais',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LemeTextFieldComponent, LemeSelectComponent],
  templateUrl: './dados-pessoais.html',
  styleUrl: './dados-pessoais.scss',
})
export class DadosPessoais {
  readonly generoOptions = [
    { value: 'feminino',  label: 'Feminino' },
    { value: 'masculino', label: 'Masculino' },
    { value: 'outro',     label: 'Outro' },
  ];

  readonly estadoCivilOptions = [
    { value: 'solteiro',   label: 'Solteiro(a)' },
    { value: 'casado',     label: 'Casado(a)' },
    { value: 'divorciado', label: 'Divorciado(a)' },
    { value: 'viuvo',      label: 'Viúvo(a)' },
  ];

  nome         = 'Jéssica Santos';
  cpf          = '123.456.789-00';
  dataNasc     = '15/04/1990';
  genero       = 'feminino';
  estadoCivil  = 'solteiro';
  nomeMae      = 'Maria Santos';
}
