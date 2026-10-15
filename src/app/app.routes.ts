import type { Routes } from '@angular/router';

export const routes: Routes = [
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
