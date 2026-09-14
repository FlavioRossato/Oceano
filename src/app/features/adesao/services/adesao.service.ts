import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AdesaoDadosService } from './adesao-dados.service';

export interface AdesaoPanelSubStep {
  id: string;
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

/**
 * Lista canônica de etapas de coleta de dados, na ordem em que aparecem
 * quando todas estão presentes. 'vinculo' e 'representantes' são condicionais
 * (ver AdesaoService.wizardSteps) — as demais aparecem sempre.
 */
const DATA_STEPS_BASE: AdesaoPanelSubStep[] = [
  { id: 'selecao-plano', label: 'Seleção de plano' },
  { id: 'vinculo', label: 'Vínculo' },
  { id: 'dados-pessoais', label: 'Dados pessoais' },
  { id: 'representantes', label: 'Representantes' },
  { id: 'contato-endereco', label: 'Contato & endereço' },
  { id: 'pep', label: 'PEP' },
  { id: 'perfil-investimento', label: 'Perfil de investimento' },
  { id: 'regime-tributacao', label: 'Regime de tributação' },
  { id: 'contribuicao', label: 'Contribuição' },
  { id: 'dados-bancarios', label: 'Dados bancários' },
  { id: 'documentos', label: 'Documentos' },
];

const FINAL_STEPS: AdesaoPanelSubStep[] = [
  { id: 'resumo', label: 'Revisão final', icon: 'fact_check', final: true },
  { id: 'termo', label: 'Termos', icon: 'draw', final: true },
];

// Etapas fora da sequência numerada (sem stepper) — não dependem do plano
// nem da idade, por isso ficam fora de qualquer computed().
const BOAS_VINDAS_STEP: AdesaoStep = {
  id: 'boas-vindas',
  label: 'Boas-vindas',
  route: '/adesao/boas-vindas',
  showBottomNav: false,
  panel: {
    estimatedTime: 'Leva cerca de 4 minutos',
    eyebrow: 'Previdência Privada',
    headline: 'Construa hoje o futuro que você merece.',
    description: 'Uma renda complementar para viver a aposentadoria com tranquilidade, no seu ritmo, com vantagens fiscais.',
  },
};

const VERIFICACAO_CPF_STEP: AdesaoStep = {
  id: 'verificacao-cpf',
  label: 'Verificação de CPF',
  route: '/adesao/verificacao-cpf',
  showBottomNav: true,
  panel: {
    icon: 'verified_user',
    headline: 'Vamos confirmar quem é você',
    description: 'Para sua segurança, precisamos confirmar sua identidade antes de continuar.',
  },
};

const SENHA_ACESSO_STEP: AdesaoStep = {
  id: 'senha-acesso',
  label: 'Senha de acesso',
  route: '/adesao/senha-acesso',
  showBottomNav: true,
  panel: {
    icon: 'verified_user',
    headline: 'Vamos confirmar quem é você',
    description: 'Para sua segurança, precisamos confirmar sua identidade antes de continuar.',
  },
};

const CONCLUSAO_STEP: AdesaoStep = {
  id: 'conclusao',
  label: 'Conclusão',
  route: '/adesao/conclusao',
  showBottomNav: false,
  panel: {
    icon: 'celebration',
    headline: 'Solicitação enviada!',
    description: 'Entraremos em contato em breve com os próximos passos da sua adesão ao plano.',
  },
};

const RETOMAR_ADESAO_STEP: AdesaoStep = {
  id: 'retomar-adesao',
  label: 'Retomar adesão',
  route: '/adesao/retomar-adesao',
  showBottomNav: false,
  panel: {
    icon: 'verified_user',
    headline: 'Vamos confirmar quem é você',
    description: 'Para sua segurança, precisamos confirmar sua identidade antes de continuar.',
  },
};

const RECUPERAR_SENHA_STEP: AdesaoStep = {
  id: 'recuperar-senha',
  label: 'Recuperar senha',
  route: '/adesao/recuperar-senha',
  showBottomNav: false,
  panel: {
    icon: 'lock_reset',
    headline: 'Redefinir senha',
    description: 'Defina uma nova senha de acesso para continuar sua adesão.',
  },
};

const ACOMPANHAMENTO_STEP: AdesaoStep = {
  id: 'acompanhamento',
  label: 'Acompanhamento',
  route: '/adesao/acompanhamento',
  showBottomNav: false,
  panel: {
    icon: 'fact_check',
    headline: 'Acompanhe sua solicitação',
    description: 'Confira o status da sua solicitação de adesão ao plano.',
  },
};

@Injectable({ providedIn: 'root' })
export class AdesaoService {
  private readonly router = inject(Router);
  private readonly dados = inject(AdesaoDadosService);

  /**
   * Lista de etapas numeradas do stepper, recalculada conforme o tipo de
   * plano (RN11: sem 'vinculo' para Instituído) e a menoridade do titular
   * (RN17/RN21: com 'representantes' quando menor de idade). Etapa 1 é
   * sempre 'selecao-plano' (RN01/RN09).
   */
  readonly wizardSteps = computed<AdesaoPanelSubStep[]>(() => {
    let steps = DATA_STEPS_BASE.filter(step => step.id !== 'representantes');

    if (this.dados.isPlanoInstituido()) {
      steps = steps.filter(step => step.id !== 'vinculo');
    }

    if (this.dados.isMenorDeIdade()) {
      const representantesStep = DATA_STEPS_BASE.find(step => step.id === 'representantes')!;
      const dadosPessoaisIndex = steps.findIndex(step => step.id === 'dados-pessoais');
      steps = [...steps.slice(0, dadosPessoaisIndex + 1), representantesStep, ...steps.slice(dadosPessoaisIndex + 1)];
    }

    return [...steps, ...FINAL_STEPS];
  });

  /** Array completo de rotas do wizard, recalculado junto com wizardSteps(). */
  readonly steps = computed<AdesaoStep[]>(() => {
    const wizardSteps = this.wizardSteps();

    const dataStepEntries: AdesaoStep[] = wizardSteps.map((step, index) => ({
      id: step.id,
      label: step.label,
      route: `/adesao/${step.id}`,
      showBottomNav: true,
      wideContent: step.id === 'resumo',
      panel: {
        steps: wizardSteps,
        activeSubStep: index,
        estimatedTime: step.final ? 'Seus dados estão protegidos' : 'Leva cerca de 4 minutos',
        footerIcon: step.id === 'resumo' ? 'lock' : undefined,
      },
    }));

    // wizardSteps[0] é sempre 'selecao-plano' (RN01) — identificação por CPF,
    // verificação de e-mail (só para quem é novo) e senha de acesso ficam
    // entre ela e o restante das etapas de dados, mas não entram no stepper
    // numerado (mesmo tratamento de hoje).
    const [selecaoPlano, ...restanteDataSteps] = dataStepEntries;

    return [
      BOAS_VINDAS_STEP,
      selecaoPlano,
      VERIFICACAO_CPF_STEP,
      SENHA_ACESSO_STEP,
      ...restanteDataSteps,
      CONCLUSAO_STEP,
      RETOMAR_ADESAO_STEP,
      RECUPERAR_SENHA_STEP,
      ACOMPANHAMENTO_STEP,
    ];
  });

  readonly currentStepIndex = signal(0);
  readonly currentStep = computed(() => this.steps()[this.currentStepIndex()]);
  readonly isFirstStep = computed(() => this.currentStepIndex() === 0);
  readonly isLastStep = computed(() => this.currentStepIndex() === this.steps().length - 1);

  private readonly numberedWizardStepsCount = computed(() => this.wizardSteps().filter(step => !step.final).length);

  /**
   * Texto "Etapa N de M" da etapa atual, recalculado junto com wizardSteps() —
   * substitui o texto que cada página exibia hardcoded no próprio template.
   * Vazio para etapas fora do stepper numerado (boas-vindas, CPF, senha, finais).
   */
  readonly currentStepLabel = computed(() => {
    const activeSubStep = this.currentStep().panel.activeSubStep;
    if (activeSubStep === undefined) return '';
    const step = this.wizardSteps()[activeSubStep];
    if (!step || step.final) return '';
    return `Etapa ${activeSubStep + 1} de ${this.numberedWizardStepsCount()}`;
  });
  readonly canContinue = signal(true);
  readonly nextOverride = signal<(() => void) | null>(null);
  readonly backOverride = signal<(() => void) | null>(null);

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        const url = (event as NavigationEnd).urlAfterRedirects;
        const index = this.steps().findIndex(step => url.includes(step.id));
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

    const steps = this.steps();
    const nextIndex = this.currentStepIndex() + 1;
    this.currentStepIndex.set(nextIndex);
    this.canContinue.set(true);
    this.router.navigate([steps[nextIndex].route]);
  }

  back(): void {
    const override = this.backOverride();
    if (override) {
      override();
      return;
    }

    if (this.isFirstStep()) return;

    const steps = this.steps();
    const previousIndex = this.currentStepIndex() - 1;
    this.currentStepIndex.set(previousIndex);
    this.canContinue.set(true);
    this.router.navigate([steps[previousIndex].route]);
  }

  goToStep(index: number): void {
    const steps = this.steps();
    if (index < 0 || index >= steps.length) return;
    this.currentStepIndex.set(index);
    this.canContinue.set(true);
    this.router.navigate([steps[index].route]);
  }

  reset(): void {
    this.currentStepIndex.set(0);
    this.canContinue.set(true);
  }
}
