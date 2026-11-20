import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { catchError, map, throwError } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthService, type UserRole } from '../services/auth.service';
import type { LoginCredentials, LoginResponse } from './login-page.interfaces';

const UNAUTHORIZED_STATUS = 401;
const INVALID_CREDENTIALS_MESSAGE = 'Onjuiste combinatie van e-mailadres en wachtwoord.';

@Injectable({
  providedIn: 'root',
})
export class LoginPageService {
  private readonly api = inject(ApiService);

  private readonly auth = inject(AuthService);

  public login(credentials: LoginCredentials): Observable<UserRole> {
    const body = { email: credentials.email, password: credentials.password };

    return this.api.post<LoginResponse>('/auth/login', body).pipe(
      map((response) => {
        this.auth.startSession({
          token: response.token,
          userId: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          partyId: response.user.partyId ?? null,
          partyName: response.user.partyName ?? null,
        }, credentials.rememberMe);

        return response.user.role;
      }),
      catchError((error: unknown) => throwError(() => this.toUserFacingError(error))),
    );
  }

  private toUserFacingError(error: unknown): Error {
    if (error instanceof HttpErrorResponse && error.status === UNAUTHORIZED_STATUS) {
      return new Error(INVALID_CREDENTIALS_MESSAGE);
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error(INVALID_CREDENTIALS_MESSAGE);
  }
}
