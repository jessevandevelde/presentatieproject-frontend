import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: async () => import('./components/dashboard/dashboard.component').then(module => module.DashboardComponent),
  },
  {
    path: 'stellingen/nieuw',
    loadComponent: async () => import('./components/statement-editor/statement-editor.component').then(module => module.StatementEditorComponent),
  },
  {
    path: 'stellingen/:id',
    loadComponent: async () => import('./components/statement-editor/statement-editor.component').then(module => module.StatementEditorComponent),
  },
  {
    path: 'partijen/nieuw',
    loadComponent: async () => import('./components/party-editor/party-editor.component').then(module => module.PartyEditorComponent),
  },
  {
    path: 'partijen/:id',
    loadComponent: async () => import('./components/party-editor/party-editor.component').then(module => module.PartyEditorComponent),
  },
];

