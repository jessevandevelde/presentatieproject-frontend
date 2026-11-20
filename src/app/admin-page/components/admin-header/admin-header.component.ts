import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { UserAvatarComponent } from '../../../components/user-avatar/user-avatar.component';

@Component({
  selector: 'stw-admin-header',
  imports: [NgOptimizedImage, UserAvatarComponent],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHeaderComponent {
  public readonly userEmail = input.required<string>();

  public readonly userName = input.required<string>();

  public readonly roleLabel = input('Super admin');

  public readonly logoutRequested = output();
}

