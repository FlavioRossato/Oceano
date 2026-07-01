import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LemeButtonComponent } from 'leme';
import { AdesaoService } from '../../services/adesao.service';

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
}
