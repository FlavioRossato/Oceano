import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LemeButtonComponent } from 'leme';

@Component({
  selector: 'app-resumo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LemeButtonComponent],
  templateUrl: './resumo.html',
  styleUrl: './resumo.scss',
})
export class Resumo {}
