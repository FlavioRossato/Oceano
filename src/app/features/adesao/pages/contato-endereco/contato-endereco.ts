import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LemeTextFieldComponent } from 'leme';

@Component({
  selector: 'app-contato-endereco',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LemeTextFieldComponent],
  templateUrl: './contato-endereco.html',
  styleUrl: './contato-endereco.scss',
})
export class ContatoEndereco {
  email        = 'jessica.santos@email.com';
  celular      = '(11) 98957-8989';
  cep          = '04567-000';
  cidadeUf     = 'São Paulo · SP';
  endereco     = 'Av. Paulista, 1578 — Bela Vista';
}
