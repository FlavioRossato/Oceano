import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'leme-loading',
  standalone: true,
  imports: [],
  templateUrl: './leme-loading.component.html',
  styleUrl: './leme-loading.component.scss',
})
export class LemeLoadingComponent {}
