import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LemeButtonComponent, LemeTagComponent } from 'leme';
import { PlanoSelecionadoService } from '@core/services/plano-selecionado.service';
import { PlanoAdesao } from '@core/models/plano-adesao.model';
import { PLANOS_ADESAO_MOCK } from '../../data/planos-adesao-mock.data';

@Component({
  selector: 'app-selecionar-plano',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LemeButtonComponent, LemeTagComponent],
  templateUrl: './selecionar-plano.html',
  styleUrl: './selecionar-plano.scss',
})
export class SelecionarPlano {
  private readonly router = inject(Router);
  private readonly planoSelecionado = inject(PlanoSelecionadoService);

  readonly planos: PlanoAdesao[] = PLANOS_ADESAO_MOCK;

  aderir(plano: PlanoAdesao): void {
    this.planoSelecionado.selecionar(plano);
    this.router.navigate(['/adesao/boas-vindas']);
  }
}
