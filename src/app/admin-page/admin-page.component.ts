import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminHeaderComponent } from './components/admin-header/admin-header.component';
import { AdminNavigationComponent } from './components/admin-navigation/admin-navigation.component';

@Component({
  selector: 'stw-admin-page',
  imports: [RouterOutlet, AdminHeaderComponent, AdminNavigationComponent],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPageComponent {
  protected readonly userEmail: string;

  protected readonly userName: string;

  private readonly authService = inject(AuthService);

  private readonly router = inject(Router);

  public constructor() {
    const session = this.authService.getSession();

    this.userEmail = session?.email ?? '';
    this.userName = session?.name ?? 'Super Admin';
  }

  protected handleLogout(): void {
    this.authService.endSession();
    void this.router.navigateByUrl('/login');
  }
}

