import { Routes } from '@angular/router';

export const ADESAO_ROUTES: Routes = [
  { path: '', redirectTo: 'boas-vindas', pathMatch: 'full' },

  // Boas-vindas: página standalone, sem AdesaoLayout
  {
    path: 'boas-vindas',
    loadComponent: () =>
      import('./pages/boas-vindas/boas-vindas').then(m => m.BoasVindas),
  },

  // Demais steps: dentro do AdesaoLayout (sidebar + nav)
  {
    path: '',
    loadComponent: () =>
      import('./adesao-layout/adesao-layout').then(m => m.AdesaoLayout),
    children: [
      {
        path: 'senha-acesso',
        loadComponent: () =>
          import('./pages/senha-acesso/senha-acesso').then(m => m.SenhaAcesso),
      },
      {
        path: 'empresa',
        loadComponent: () =>
          import('./pages/empresa/empresa').then(m => m.Empresa),
      },
      {
        path: 'dados-pessoais',
        loadComponent: () =>
          import('./pages/dados-pessoais/dados-pessoais').then(m => m.DadosPessoais),
      },
      {
        path: 'contato-endereco',
        loadComponent: () =>
          import('./pages/contato-endereco/contato-endereco').then(m => m.ContatoEndereco),
      },
      {
        path: 'resumo',
        loadComponent: () =>
          import('./pages/resumo/resumo').then(m => m.Resumo),
      },
      {
        path: 'conclusao',
        loadComponent: () =>
          import('./pages/conclusao/conclusao').then(m => m.Conclusao),
      },
    ],
  },
];
