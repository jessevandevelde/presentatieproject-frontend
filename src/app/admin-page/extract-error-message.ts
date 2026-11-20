import { HttpErrorResponse } from '@angular/common/http';

const GENERIC_ERROR_MESSAGE = 'Er ging iets mis. Probeer het opnieuw.';

export function extractErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const body: unknown = error.error;

    if (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string') {
      return body.error;
    }

    return GENERIC_ERROR_MESSAGE;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return GENERIC_ERROR_MESSAGE;
}

