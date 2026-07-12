import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LemeTextFieldComponent, LemeSelectComponent, LemeCheckboxComponent } from 'leme';
import { AdesaoDadosService } from '../../services/adesao-dados.service';
import { AdesaoService } from '../../services/adesao.service';

@Component({
  selector: 'app-vinculo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LemeTextFieldComponent, LemeSelectComponent, LemeCheckboxComponent],
  templateUrl: './vinculo.html',
  styleUrl: './vinculo.scss',
})
export class Vinculo implements OnInit, OnDestroy {
  private readonly dados = inject(AdesaoDadosService);
  private readonly adesao = inject(AdesaoService);

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

  onConfirmadoChange(value: boolean): void {
    this.confirmado = value;
    this.adesao.setCanContinue(value);
  }

  ngOnInit(): void {
    const atual = this.dados.vinculo();
    this.empresa = atual.empresa;
    this.matricula = atual.matricula;
    this.cargo = atual.cargo;
    this.salarioMensal = atual.salarioMensal;
    this.dataAdmissao = atual.dataAdmissao;
    this.regimeContratacao = atual.regimeContratacao;
    this.confirmado = atual.confirmado;
    this.adesao.setCanContinue(this.confirmado);
  }

  ngOnDestroy(): void {
    this.adesao.setCanContinue(true);
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
