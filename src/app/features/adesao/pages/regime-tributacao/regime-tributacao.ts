import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { LemeTagComponent, LemeMessageComponent } from 'leme';
import { AdesaoDadosService, RegimeTributacaoForm } from '../../services/adesao-dados.service';

@Component({
  selector: 'app-regime-tributacao',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LemeTagComponent, LemeMessageComponent],
  templateUrl: './regime-tributacao.html',
  styleUrl: './regime-tributacao.scss',
})
export class RegimeTributacao implements OnInit, OnDestroy {
  private readonly dados = inject(AdesaoDadosService);

  readonly regime = signal<RegimeTributacaoForm['regime']>('regressivo');
  readonly mostrarProgressivas = signal(false);
  readonly mostrarRegressivas = signal(false);

  readonly aliquotasProgressivas = [
    { base: 'Até 2.112,00', aliquota: 'Isento', deducao: 'Isento' },
    { base: 'de 2.112,00 até 2.826,65', aliquota: '7,50%', deducao: 'R$ 158,40' },
    { base: 'de 2.826,66 até 3.751,05', aliquota: '15,00%', deducao: 'R$ 370,40' },
    { base: 'de 3.751,06 até 4.664,68', aliquota: '22,50%', deducao: 'R$ 651,73' },
    { base: 'acima de 4.664,68', aliquota: '27,50%', deducao: 'R$ 884,96' },
  ];

  readonly aliquotasRegressivas = [
    { prazo: 'Até 2 anos', aliquota: '35%' },
    { prazo: '2 a 4 anos', aliquota: '30%' },
    { prazo: '4 a 6 anos', aliquota: '25%' },
    { prazo: '6 a 8 anos', aliquota: '20%' },
    { prazo: '8 a 10 anos', aliquota: '15%' },
    { prazo: 'Acima de 10 anos', aliquota: '10%' },
  ];

  ngOnInit(): void {
    this.regime.set(this.dados.regimeTributacao().regime);
  }

  ngOnDestroy(): void {
    this.dados.updateRegimeTributacao({ regime: this.regime() });
  }
}
