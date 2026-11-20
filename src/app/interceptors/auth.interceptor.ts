import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const UNAUTHORIZED_STATUS = 401;

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getSession()?.token;

  if (token === undefined) {
    return next(request);
  }

  // Een verlopen of ongeldig token beëindigt de sessie en stuurt de gebruiker terug naar de loginpagina.
  return next(request.clone({ headers: request.headers.set('Authorization', `Bearer ${token}`) })).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === UNAUTHORIZED_STATUS) {
        authService.endSession();
        void router.navigateByUrl('/login');
      }

      return throwError(() => error);
    }),
  );
};
