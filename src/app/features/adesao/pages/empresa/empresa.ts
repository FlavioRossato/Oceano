import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LemeTextFieldComponent, LemeSelectComponent } from 'leme';

@Component({
  selector: 'app-empresa',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LemeTextFieldComponent, LemeSelectComponent],
  templateUrl: './empresa.html',
  styleUrl: './empresa.scss',
})
export class Empresa {
  readonly empresaOptions = [
    { value: 'ford',      label: 'Ford do Brasil Ltda.' },
    { value: 'petrobras', label: 'Petrobras S.A.' },
    { value: 'vale',      label: 'Vale S.A.' },
  ];

  readonly relacaoOptions = [
    { value: 'clt',         label: 'CLT' },
    { value: 'pj',          label: 'Pessoa Jurídica' },
    { value: 'estatutario', label: 'Estatutário' },
  ];

  empresa      = 'ford';
  matricula    = '75486';
  cargo        = 'Engenheiro mecânico';
  salario      = 'R$ 9.999,99';
  dataAdmissao = '20/11/2014';
  relacao      = 'clt';
}
