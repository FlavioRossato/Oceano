import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LemeTextFieldComponent, LemeSelectComponent, LemeCheckboxComponent } from 'leme';
import { AdesaoDadosService } from '../../services/adesao-dados.service';

@Component({
  selector: 'app-vinculo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LemeTextFieldComponent, LemeSelectComponent, LemeCheckboxComponent],
  templateUrl: './vinculo.html',
  styleUrl: './vinculo.scss',
})
export class Vinculo implements OnInit, OnDestroy {
  constructor(private readonly dados: AdesaoDadosService) {}

  readonly tipoVinculoOptions = [
    { value: 'marido',  label: 'Marido' },
    { value: 'esposa',  label: 'Esposa' },
    { value: 'filho',   label: 'Filho(a)' },
    { value: 'pai',     label: 'Pai' },
    { value: 'mae',     label: 'Mãe' },
    { value: 'irmao',   label: 'Irmão(ã)' },
    { value: 'outro',   label: 'Outro' },
  ];

  cpfTitular = '';
  nomeParticipante = '';
  tipoVinculo = '';
  confirmado = false;

  ngOnInit(): void {
    const atual = this.dados.vinculo();
    this.cpfTitular = atual.cpfTitular;
    this.nomeParticipante = atual.nomeParticipante;
    this.tipoVinculo = atual.tipoVinculo;
    this.confirmado = atual.confirmado;
  }

  ngOnDestroy(): void {
    this.dados.updateVinculo({
      cpfTitular: this.cpfTitular,
      nomeParticipante: this.nomeParticipante,
      tipoVinculo: this.tipoVinculo,
      confirmado: this.confirmado,
    });
  }
}
