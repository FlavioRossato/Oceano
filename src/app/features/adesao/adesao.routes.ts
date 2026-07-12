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
        path: 'vinculo',
        loadComponent: () =>
          import('./pages/vinculo/vinculo').then(m => m.Vinculo),
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
        path: 'pep',
        loadComponent: () =>
          import('./pages/pep/pep').then(m => m.Pep),
      },
      {
        path: 'perfil-investimento',
        loadComponent: () =>
          import('./pages/perfil-investimento/perfil-investimento').then(m => m.PerfilInvestimento),
      },
      {
        path: 'regime-tributacao',
        loadComponent: () =>
          import('./pages/regime-tributacao/regime-tributacao').then(m => m.RegimeTributacao),
      },
      {
        path: 'contribuicao',
        loadComponent: () =>
          import('./pages/contribuicao/contribuicao').then(m => m.Contribuicao),
      },
      {
        path: 'dados-bancarios',
        loadComponent: () =>
          import('./pages/dados-bancarios/dados-bancarios').then(m => m.DadosBancarios),
      },
      {
        path: 'documentos',
        loadComponent: () =>
          import('./pages/documentos/documentos').then(m => m.Documentos),
      },
      {
        path: 'resumo',
        loadComponent: () =>
          import('./pages/resumo/resumo').then(m => m.Resumo),
      },
      {
        path: 'termo',
        loadComponent: () =>
          import('./pages/termo/termo').then(m => m.Termo),
      },
      {
        path: 'conclusao',
        loadComponent: () =>
          import('./pages/conclusao/conclusao').then(m => m.Conclusao),
      },

      // Verificação de CPF e telas derivadas (retomada / recuperação de senha /
      // acompanhamento). Não fazem parte da sequência linear do wizard — a
      // navegação entre elas é feita via router.navigate() direto, conforme o
      // resultado da consulta ao ParticipanteMockService.
      {
        path: 'verificacao-cpf',
        loadComponent: () =>
          import('./pages/verificacao-cpf/verificacao-cpf').then(m => m.VerificacaoCpf),
      },
      {
        path: 'retomar-adesao',
        loadComponent: () =>
          import('./pages/retomar-adesao/retomar-adesao').then(m => m.RetomarAdesao),
      },
      {
        path: 'recuperar-senha',
        loadComponent: () =>
          import('./pages/recuperar-senha/recuperar-senha').then(m => m.RecuperarSenha),
      },
      {
        path: 'acompanhamento',
        loadComponent: () =>
          import('./pages/acompanhamento/acompanhamento').then(m => m.Acompanhamento),
      },
    ],
  },
];
