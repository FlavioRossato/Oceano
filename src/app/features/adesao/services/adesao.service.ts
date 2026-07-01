import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export interface AdesaoPanelSubStep {
  label: string;
  icon?: string; // quando definido, exibe ícone no lugar do número
}

export interface AdesaoPanelConfig {
  // Branding mode
  icon?: string;
  eyebrow?: string;
  headline?: string;
  description?: string;
  // Stepper mode
  steps?: AdesaoPanelSubStep[];
  activeSubStep?: number;
  estimatedTime?: string;
  footerIcon?: string; // substitui o ícone padrão do rodapé do painel
}

export interface AdesaoStep {
  id: string;
  label: string;
  route: string;
  showBottomNav?: boolean;
  wideContent?: boolean; // exceção: max-width expandido para páginas densas
  panel: AdesaoPanelConfig;
}

const DATA_STEPS: AdesaoPanelSubStep[] = [
  { label: 'Empresa' },
  { label: 'Dados pessoais' },
  { label: 'Contato & endereço' },
  { label: 'Contribuição' },
  { label: 'Banco & beneficiários' },
  { label: 'Perfil de investimento' },
];

const RESUMO_STEPS: AdesaoPanelSubStep[] = [
  ...DATA_STEPS,
  { label: 'Revisão final', icon: 'receipt_long' },
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
        eyebrow: 'Previdência Privada',
        headline: 'Construa hoje o futuro que você merece.',
        description: 'Uma renda complementar para viver a aposentadoria com tranquilidade — no seu ritmo, com vantagens fiscais.',
      },
    },
    {
      id: 'senha-acesso',
      label: 'Senha de acesso',
      route: '/adesao/senha-acesso',
      showBottomNav: true,
      panel: {
        icon: 'shield',
        headline: 'Sua segurança em primeiro lugar',
        description: 'Esta será a <strong>senha de acesso ao portal</strong> — você vai usá-la sempre que entrar para acompanhar seu plano. Guarde-a com cuidado.',
      },
    },
    {
      id: 'empresa',
      label: 'Empresa',
      route: '/adesao/empresa',
      showBottomNav: true,
      panel: { steps: DATA_STEPS, activeSubStep: 0, estimatedTime: 'Leva cerca de 4 minutos' },
    },
    {
      id: 'dados-pessoais',
      label: 'Dados pessoais',
      route: '/adesao/dados-pessoais',
      showBottomNav: true,
      panel: { steps: DATA_STEPS, activeSubStep: 1, estimatedTime: 'Leva cerca de 4 minutos' },
    },
    {
      id: 'contato-endereco',
      label: 'Contato & endereço',
      route: '/adesao/contato-endereco',
      showBottomNav: true,
      panel: { steps: DATA_STEPS, activeSubStep: 2, estimatedTime: 'Leva cerca de 4 minutos' },
    },
    {
      id: 'resumo',
      label: 'Revisão final',
      route: '/adesao/resumo',
      showBottomNav: true,
      wideContent: true,
      panel: {
        steps: RESUMO_STEPS,
        activeSubStep: 6,
        estimatedTime: 'Seus dados estão protegidos',
        footerIcon: 'lock',
      },
    },
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

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => {
        const url = (e as NavigationEnd).urlAfterRedirects;
        const idx = this.steps.findIndex(s => url.includes(s.id));
        if (idx !== -1) this.currentStepIndex.set(idx);
      });
  }
  readonly isFirstStep = computed(() => this.currentStepIndex() === 0);
  readonly isLastStep = computed(() => this.currentStepIndex() === this.steps.length - 1);
  readonly canContinue = signal(true);

  setCanContinue(value: boolean): void {
    this.canContinue.set(value);
  }

  next(): void {
    if (this.isLastStep()) return;
    const next = this.currentStepIndex() + 1;
    this.currentStepIndex.set(next);
    this.canContinue.set(true);
    this.router.navigate([this.steps[next].route]);
  }

  back(): void {
    if (this.isFirstStep()) return;
    const prev = this.currentStepIndex() - 1;
    this.currentStepIndex.set(prev);
    this.canContinue.set(true);
    this.router.navigate([this.steps[prev].route]);
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
