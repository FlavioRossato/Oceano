import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LemeButtonComponent } from 'leme';
import { PlanoSelecionadoService } from '@core/services/plano-selecionado.service';
import { AdesaoPanelSubStep, AdesaoService } from '../services/adesao.service';

interface StepEntry {
  step: AdesaoPanelSubStep;
  index: number;
}

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
  protected readonly plano = inject(PlanoSelecionadoService).atual;
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly footerLabel = computed(() => (this.adesao.currentStep().id === 'termo' ? 'Enviar solicitação' : 'Continuar'));
  readonly footerIcon = computed(() => (this.adesao.currentStep().id === 'termo' ? 'send' : 'arrow_forward'));

  // Etapas numeradas (coleta de dados) e etapas de finalização (revisão + termos)
  // são exibidas em dois grupos separados no stepper — a segunda sem numeração.
  protected readonly stepEntries = computed<StepEntry[]>(() =>
    (this.adesao.currentStep().panel.steps ?? []).map((step, index) => ({ step, index })),
  );
  protected readonly numberedStepEntries = computed(() => this.stepEntries().filter(entry => !entry.step.final));
  protected readonly finalStepEntries = computed(() => this.stepEntries().filter(entry => entry.step.final));

  protected readonly mobileStepsLabel = computed(() => {
    const activeIndex = this.adesao.currentStep().panel.activeSubStep;
    const entry = this.stepEntries().find(e => e.index === activeIndex);
    if (!entry) return '';
    if (entry.step.final) return `Finalização · ${entry.step.label}`;
    const position = this.numberedStepEntries().findIndex(e => e.index === entry.index);
    return `Etapa ${position + 1} de ${this.numberedStepEntries().length} · ${entry.step.label}`;
  });

  protected readonly mobileStepsExpanded = signal(false);

  constructor() {
    // Mantém a etapa ativa do stepper sempre visível — se a lista de passos
    // não couber na altura do painel, rola até ela em vez de deixá-la cortada.
    effect(() => {
      this.adesao.currentStep();
      this.mobileStepsExpanded.set(false);
      setTimeout(() => {
        this.host.nativeElement
          .querySelector('.adesao-layout__step--active')
          ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }, 0);
    });
  }

  goToPanelStep(index: number): void {
    this.adesao.goToStep(index + 2);
    this.mobileStepsExpanded.set(false);
  }

  toggleMobileSteps(): void {
    this.mobileStepsExpanded.update(expanded => !expanded);
  }
}
