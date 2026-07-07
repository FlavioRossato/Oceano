import { ChangeDetectionStrategy, Component, OnDestroy, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LemeCheckboxComponent } from 'leme';
import { AdesaoService } from '../../services/adesao.service';

@Component({
  selector: 'app-termo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LemeCheckboxComponent],
  templateUrl: './termo.html',
  styleUrl: './termo.scss',
})
export class Termo implements OnDestroy {
  private readonly adesao = inject(AdesaoService);

  readonly expandido = signal(true);
  aceito = false;

  private readonly aceitoSignal = signal(false);

  constructor() {
    effect(() => this.adesao.setCanContinue(this.aceitoSignal()), { allowSignalWrites: true });
  }

  onAceitoChange(value: boolean): void {
    this.aceito = value;
    this.aceitoSignal.set(value);
  }

  ngOnDestroy(): void {
    this.adesao.setCanContinue(true);
  }
}
