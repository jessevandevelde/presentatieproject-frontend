import { provideHttpClient, withFetch } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideStore(),
    provideEffects(),
    importProvidersFrom([
      StoreDevtoolsModule.instrument({
        name: 'ROC Kompas',
        maxAge: 25,
        logOnly: false,
        serialize: true,
        connectInZone: true,
      }),
    ]),
  ],
})
  .catch((error: unknown) => { console.error(error); });
