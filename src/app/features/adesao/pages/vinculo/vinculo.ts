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

  readonly empresaOptions = [
    { value: 'ford', label: 'Ford' },
    { value: 'volkswagen', label: 'Volkswagen' },
    { value: 'general-motors', label: 'General Motors' },
    { value: 'outra', label: 'Outra' },
  ];

  readonly regimeContratacaoOptions = [
    { value: 'clt', label: 'CLT' },
    { value: 'pj', label: 'PJ' },
    { value: 'estatutario', label: 'Estatutário' },
    { value: 'autonomo', label: 'Autônomo' },
  ];

  empresa = '';
  matricula = '';
  cargo = '';
  salarioMensal = '';
  dataAdmissao = '';
  regimeContratacao = '';
  confirmado = false;

  ngOnInit(): void {
    const atual = this.dados.vinculo();
    this.empresa = atual.empresa;
    this.matricula = atual.matricula;
    this.cargo = atual.cargo;
    this.salarioMensal = atual.salarioMensal;
    this.dataAdmissao = atual.dataAdmissao;
    this.regimeContratacao = atual.regimeContratacao;
    this.confirmado = atual.confirmado;
  }

  ngOnDestroy(): void {
    this.dados.updateVinculo({
      empresa: this.empresa,
      matricula: this.matricula,
      cargo: this.cargo,
      salarioMensal: this.salarioMensal,
      dataAdmissao: this.dataAdmissao,
      regimeContratacao: this.regimeContratacao,
      confirmado: this.confirmado,
    });
  }
}
