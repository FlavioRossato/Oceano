import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LemeButtonComponent } from 'leme';
import { AdesaoService } from '../../services/adesao.service';

@Component({
  selector: 'app-boas-vindas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LemeButtonComponent],
  templateUrl: './boas-vindas.html',
  styleUrl: './boas-vindas.scss',
})
export class BoasVindas {
  protected readonly adesao = inject(AdesaoService);

  iniciar(): void {
    this.adesao.next();
  }
}
