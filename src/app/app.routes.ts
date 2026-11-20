import { adminAuthGuard } from './guards/admin-auth.guard';
import { partyAdminAuthGuard } from './guards/party-admin-auth.guard';
import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'login', loadChildren: async () => import('./login-page/login-page.routes').then(m => m.routes) },
  { path: 'admin', canActivate: [adminAuthGuard], loadComponent: async () => import('./cms-page/cms-page.component').then(m => m.CmsPageComponent) },
  { path: 'partij', canActivate: [partyAdminAuthGuard], loadComponent: async () => import('./party-admin-page/party-admin-page.component').then(m => m.PartyAdminPageComponent) },
  { path: 'stemwijzer', redirectTo: '', pathMatch: 'full' },
  {
    path: 'visualisatie',
    loadComponent: async () => import('./visualization-page/visualization-page.component')
      .then(module => module.VisualizationPageComponent),
    title: 'ROC Kompas | Live inzichten',
  },
  {
    path: '',
    loadComponent: async () => import('./roc-kompas-page/roc-kompas-page.component')
      .then(module => module.RocKompasPageComponent),
    title: 'ROC Kompas | Stellingen',
  },
  {
    path: '**',
    redirectTo: '',
  },
];


