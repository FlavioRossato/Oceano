import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LemeTextFieldComponent, LemeSelectComponent, LemeSwitchComponent, LemeModalComponent } from 'leme';
import { AdesaoDadosService } from '../../services/adesao-dados.service';

@Component({
  selector: 'app-pep',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LemeTextFieldComponent, LemeSelectComponent, LemeSwitchComponent, LemeModalComponent],
  templateUrl: './pep.html',
  styleUrl: './pep.scss',
})
export class Pep implements OnInit, OnDestroy {
  private readonly dados = inject(AdesaoDadosService);

  readonly relacaoOptions = [
    { value: 'pai',     label: 'Pai' },
    { value: 'mae',     label: 'Mãe' },
    { value: 'filho',   label: 'Filho(a)' },
    { value: 'irmao',   label: 'Irmão(ã)' },
    { value: 'primo',   label: 'Primo(a)' },
    { value: 'conjuge', label: 'Cônjuge' },
    { value: 'outro',   label: 'Outro' },
  ];

  isPep = false;
  relacao = '';
  cargo = '';

  readonly showInfo = signal(false);

  ngOnInit(): void {
    const atual = this.dados.pep();
    this.isPep = atual.isPep;
    this.relacao = atual.relacao;
    this.cargo = atual.cargo;
  }

  ngOnDestroy(): void {
    this.dados.updatePep({
      isPep: this.isPep,
      relacao: this.relacao,
      cargo: this.cargo,
    });
  }
}
