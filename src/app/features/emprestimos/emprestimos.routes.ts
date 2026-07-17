import { Routes } from '@angular/router';

// Feature em construção — por enquanto só existe a tela de loading da
// solicitação de empréstimo, isolada para desenvolvimento e validação
// visual. Ainda não está integrada a nenhum fluxo real.
export const EMPRESTIMOS_ROUTES: Routes = [
  {
    path: 'loading',
    loadComponent: () =>
      import('./pages/loading-solicitacao/loading-solicitacao').then(m => m.LoadingSolicitacao),
  },
];
