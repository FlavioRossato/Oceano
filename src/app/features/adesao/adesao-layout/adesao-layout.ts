import { ChangeDetectionStrategy, Component, ElementRef, effect, inject } from '@angular/core';
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
  private readonly host = inject(ElementRef<HTMLElement>);

  constructor() {
    // Mantém a etapa ativa do stepper sempre visível — se a lista de passos
    // não couber na altura do painel, rola até ela em vez de deixá-la cortada.
    effect(() => {
      this.adesao.currentStep();
      setTimeout(() => {
        this.host.nativeElement
          .querySelector('.adesao-layout__step--active')
          ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }, 0);
    });
  }
}
