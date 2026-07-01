import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'app',
    pathMatch: 'full',
  },
  {
    path: 'app',
    loadComponent: () => import('./layouts/shell/shell').then(m => m.Shell),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      // Registre aqui as feature routes via lazy loading:
      // {
      //   path: 'dashboard',
      //   loadChildren: () =>
      //     import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
      // },
    ],
  },
  {
    path: 'adesao',
    loadChildren: () =>
      import('./features/adesao/adesao.routes').then(m => m.ADESAO_ROUTES),
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout').then(m => m.AuthLayout),
    children: [
      // Rotas públicas (login, recuperar senha, etc.) entram aqui
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
