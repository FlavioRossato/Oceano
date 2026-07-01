import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { AdesaoService } from '../../services/adesao.service';

interface Requirement {
  key: 'length' | 'uppercase' | 'lowercase' | 'number' | 'special';
  label: string;
}

@Component({
  selector: 'app-senha-acesso',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './senha-acesso.html',
  styleUrl: './senha-acesso.scss',
})
export class SenhaAcesso implements OnDestroy {
  private readonly adesao = inject(AdesaoService);

  readonly password = signal('');
  readonly showPassword = signal(false);

  readonly requirements = computed(() => ({
    length:    this.password().length >= 8,
    uppercase: /[A-Z]/.test(this.password()),
    lowercase: /[a-z]/.test(this.password()),
    number:    /[0-9]/.test(this.password()),
    special:   /[!@#$%^&*()\-_=+[\]{};':"\\|,.<>/?]/.test(this.password()),
  }));

  readonly metCount = computed(() =>
    Object.values(this.requirements()).filter(Boolean).length
  );

  readonly strengthLevel = computed(() => {
    const c = this.metCount();
    if (c <= 1) return 0;
    if (c <= 2) return 1;
    if (c <= 3) return 2;
    return 3;
  });

  readonly allMet = computed(() => this.metCount() === 5);

  readonly requirementList: Requirement[] = [
    { key: 'length',    label: '8 caracteres' },
    { key: 'uppercase', label: 'Maiúscula' },
    { key: 'lowercase', label: 'Minúscula' },
    { key: 'number',    label: 'Número' },
    { key: 'special',   label: 'Caractere especial' },
  ];

  constructor() {
    this.adesao.setCanContinue(false);
    effect(() => {
      this.adesao.setCanContinue(this.allMet());
    }, { allowSignalWrites: true });
  }

  onPasswordInput(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  ngOnDestroy(): void {
    this.adesao.setCanContinue(true);
  }
}
