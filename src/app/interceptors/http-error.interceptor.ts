import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

const OFFLINE_STATUS = 0;
const SERVER_ERROR_THRESHOLD = 500;
const GENERIC_ERROR_MESSAGE = 'Er is iets misgegaan. Probeer het later opnieuw.';

function isGenericFailure(error: HttpErrorResponse): boolean {
  return error.status === OFFLINE_STATUS || error.status >= SERVER_ERROR_THRESHOLD;
}

export const httpErrorInterceptor: HttpInterceptorFn = (request, next) => next(request).pipe(
  catchError((error: unknown) => {
    if (error instanceof HttpErrorResponse && isGenericFailure(error)) {
      return throwError(() => new Error(GENERIC_ERROR_MESSAGE));
    }

    return throwError(() => error);
  }),
);
