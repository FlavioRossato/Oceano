import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LemeButtonComponent } from 'leme';
import { AdesaoService } from '../../services/adesao.service';
import { AdesaoDadosService } from '../../services/adesao-dados.service';

@Component({
  selector: 'app-conclusao',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LemeButtonComponent],
  templateUrl: './conclusao.html',
  styleUrl: './conclusao.scss',
})
export class Conclusao {
  protected readonly adesao = inject(AdesaoService);
  protected readonly dados = inject(AdesaoDadosService);
  private readonly router = inject(Router);

  voltarInicio(): void {
    this.router.navigate(['/adesao/boas-vindas']);
  }
}
