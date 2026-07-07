import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export interface AdesaoPanelSubStep {
  label: string;
  icon?: string;
  /** Etapa de finalização (revisão/assinatura) — exibida à parte, sem numeração, no fim do stepper. */
  final?: boolean;
}

export interface AdesaoPanelConfig {
  icon?: string;
  eyebrow?: string;
  headline?: string;
  description?: string;
  steps?: AdesaoPanelSubStep[];
  activeSubStep?: number;
  estimatedTime?: string;
  footerIcon?: string;
}

export interface AdesaoStep {
  id: string;
  label: string;
  route: string;
  showBottomNav?: boolean;
  wideContent?: boolean;
  panel: AdesaoPanelConfig;
}

const DATA_STEPS: AdesaoPanelSubStep[] = [
  { label: 'Vínculo' },
  { label: 'Dados pessoais' },
  { label: 'Contato & endereço' },
  { label: 'PEP' },
  { label: 'Perfil de investimento' },
  { label: 'Regime de tributação' },
  { label: 'Contribuição' },
  { label: 'Dados bancários' },
  { label: 'Documentos' },
];

const WIZARD_STEPS: AdesaoPanelSubStep[] = [
  ...DATA_STEPS,
  { label: 'Revisão final', icon: 'fact_check', final: true },
  { label: 'Termos', icon: 'draw', final: true },
];

@Injectable({ providedIn: 'root' })
export class AdesaoService {
  private readonly router = inject(Router);

  readonly steps: AdesaoStep[] = [
    {
      id: 'boas-vindas',
      label: 'Boas-vindas',
      route: '/adesao/boas-vindas',
      showBottomNav: false,
      panel: {
        steps: WIZARD_STEPS,
        activeSubStep: -1,
        estimatedTime: 'Leva cerca de 4 minutos',
        eyebrow: 'Previdência Privada',
        headline: 'Construa hoje o futuro que você merece.',
        description: 'Uma renda complementar para viver a aposentadoria com tranquilidade, no seu ritmo, com vantagens fiscais.',
      },
    },
    {
      id: 'senha-acesso',
      label: 'Senha de acesso',
      route: '/adesao/senha-acesso',
      showBottomNav: true,
      panel: {
        steps: WIZARD_STEPS,
        activeSubStep: -1,
        estimatedTime: 'Leva cerca de 4 minutos',
        icon: 'shield',
        headline: 'Sua segurança em primeiro lugar',
        description: 'Esta será a <strong>senha de acesso ao portal</strong>. Você vai usá-la sempre que entrar para acompanhar seu plano. Guarde-a com cuidado.',
      },
    },
    { id: 'vinculo', label: 'Vínculo', route: '/adesao/vinculo', showBottomNav: true, panel: { steps: WIZARD_STEPS, activeSubStep: 0, estimatedTime: 'Leva cerca de 4 minutos' } },
    { id: 'dados-pessoais', label: 'Dados pessoais', route: '/adesao/dados-pessoais', showBottomNav: true, panel: { steps: WIZARD_STEPS, activeSubStep: 1, estimatedTime: 'Leva cerca de 4 minutos' } },
    { id: 'contato-endereco', label: 'Contato & endereço', route: '/adesao/contato-endereco', showBottomNav: true, panel: { steps: WIZARD_STEPS, activeSubStep: 2, estimatedTime: 'Leva cerca de 4 minutos' } },
    { id: 'pep', label: 'PEP', route: '/adesao/pep', showBottomNav: true, panel: { steps: WIZARD_STEPS, activeSubStep: 3, estimatedTime: 'Leva cerca de 4 minutos' } },
    { id: 'perfil-investimento', label: 'Perfil de investimento', route: '/adesao/perfil-investimento', showBottomNav: true, panel: { steps: WIZARD_STEPS, activeSubStep: 4, estimatedTime: 'Leva cerca de 4 minutos' } },
    { id: 'regime-tributacao', label: 'Regime de tributação', route: '/adesao/regime-tributacao', showBottomNav: true, panel: { steps: WIZARD_STEPS, activeSubStep: 5, estimatedTime: 'Leva cerca de 4 minutos' } },
    { id: 'contribuicao', label: 'Contribuição', route: '/adesao/contribuicao', showBottomNav: true, panel: { steps: WIZARD_STEPS, activeSubStep: 6, estimatedTime: 'Leva cerca de 4 minutos' } },
    { id: 'dados-bancarios', label: 'Dados bancários', route: '/adesao/dados-bancarios', showBottomNav: true, panel: { steps: WIZARD_STEPS, activeSubStep: 7, estimatedTime: 'Leva cerca de 4 minutos' } },
    { id: 'documentos', label: 'Documentos', route: '/adesao/documentos', showBottomNav: true, panel: { steps: WIZARD_STEPS, activeSubStep: 8, estimatedTime: 'Leva cerca de 4 minutos' } },
    {
      id: 'resumo',
      label: 'Revisão final',
      route: '/adesao/resumo',
      showBottomNav: true,
      wideContent: true,
      panel: { steps: WIZARD_STEPS, activeSubStep: 9, estimatedTime: 'Seus dados estão protegidos', footerIcon: 'lock' },
    },
    { id: 'termo', label: 'Termos', route: '/adesao/termo', showBottomNav: true, panel: { steps: WIZARD_STEPS, activeSubStep: 10, estimatedTime: 'Leva cerca de 4 minutos' } },
    {
      id: 'conclusao',
      label: 'Conclusão',
      route: '/adesao/conclusao',
      showBottomNav: false,
      panel: {
        icon: 'celebration',
        headline: 'Solicitação enviada!',
        description: 'Entraremos em contato em breve com os próximos passos da sua adesão ao plano.',
      },
    },
  ];

  readonly currentStepIndex = signal(0);
  readonly currentStep = computed(() => this.steps[this.currentStepIndex()]);
  readonly isFirstStep = computed(() => this.currentStepIndex() === 0);
  readonly isLastStep = computed(() => this.currentStepIndex() === this.steps.length - 1);
  readonly canContinue = signal(true);
  readonly nextOverride = signal<(() => void) | null>(null);
  readonly backOverride = signal<(() => void) | null>(null);

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        const url = (event as NavigationEnd).urlAfterRedirects;
        const index = this.steps.findIndex(step => url.includes(step.id));
        if (index !== -1) this.currentStepIndex.set(index);
      });
  }

  setNextOverride(fn: (() => void) | null): void {
    this.nextOverride.set(fn);
  }

  setBackOverride(fn: (() => void) | null): void {
    this.backOverride.set(fn);
  }

  setCanContinue(value: boolean): void {
    this.canContinue.set(value);
  }

  next(): void {
    const override = this.nextOverride();
    if (override) {
      override();
      return;
    }

    if (this.isLastStep()) return;

    const nextIndex = this.currentStepIndex() + 1;
    this.currentStepIndex.set(nextIndex);
    this.canContinue.set(true);
    this.router.navigate([this.steps[nextIndex].route]);
  }

  back(): void {
    const override = this.backOverride();
    if (override) {
      override();
      return;
    }

    if (this.isFirstStep()) return;

    const previousIndex = this.currentStepIndex() - 1;
    this.currentStepIndex.set(previousIndex);
    this.canContinue.set(true);
    this.router.navigate([this.steps[previousIndex].route]);
  }

  goToStep(index: number): void {
    if (index < 0 || index >= this.steps.length) return;
    this.currentStepIndex.set(index);
    this.canContinue.set(true);
    this.router.navigate([this.steps[index].route]);
  }

  reset(): void {
    this.currentStepIndex.set(0);
    this.canContinue.set(true);
  }
}
