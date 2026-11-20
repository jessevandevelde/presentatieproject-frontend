import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BrandMarkComponent } from '../components/brand-mark/brand-mark.component';
import { SecurityNoticeComponent } from '../components/security-notice/security-notice.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import type { LoginCredentials } from './login-page.interfaces';
import { LoginPageService } from './login-page.service';

@Component({
  selector: 'stw-login-page',
  imports: [BrandMarkComponent, SecurityNoticeComponent, LoginFormComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  protected readonly loading = signal(false);

  protected readonly errorMessage = signal<string | null>(null);

  protected readonly currentYear = new Date().getFullYear();

  private readonly loginPageService = inject(LoginPageService);

  private readonly router = inject(Router);

  protected handleLogin(credentials: LoginCredentials): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.loginPageService.login(credentials).subscribe({
      next: (role) => {
        this.loading.set(false);
        void this.router.navigateByUrl(role === 'party-admin' ? '/partij' : '/admin');
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(error instanceof Error ? error.message : null);
      },
    });
  }
}
