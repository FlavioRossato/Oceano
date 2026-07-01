import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LemeButtonComponent } from 'leme';
import { AdesaoService } from '../services/adesao.service';

@Component({
  selector: 'app-adesao-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, LemeButtonComponent],
  templateUrl: './adesao-layout.html',
  styleUrl: './adesao-layout.scss',
})
export class AdesaoLayout {
  protected readonly adesao = inject(AdesaoService);
}
