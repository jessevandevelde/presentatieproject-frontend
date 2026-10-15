import type { Routes } from '@angular/router';

export const routes: Routes = [
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
