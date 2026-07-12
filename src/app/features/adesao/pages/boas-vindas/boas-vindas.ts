import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LemeButtonComponent } from 'leme';

@Component({
  selector: 'app-boas-vindas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LemeButtonComponent],
  templateUrl: './boas-vindas.html',
  styleUrl: './boas-vindas.scss',
})
export class BoasVindas {
  private readonly router = inject(Router);

  iniciar(): void {
    this.router.navigate(['/adesao/verificacao-cpf']);
  }
}
