import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: async () => import('./login-page.component').then(module => module.LoginPageComponent),
  },
];
