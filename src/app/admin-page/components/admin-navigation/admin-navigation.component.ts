import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'stw-admin-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-navigation.component.html',
  styleUrl: './admin-navigation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNavigationComponent {
}

