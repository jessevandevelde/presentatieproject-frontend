import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const MAX_INITIALS = 2;

@Component({
  selector: 'stw-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarComponent {
  public readonly name = input.required<string>();

  public readonly role = input('');

  public readonly tone = input<'light' | 'dark'>('dark');

  protected readonly initials = computed(() => this.name()
    .split(' ')
    .filter(part => part.length > 0)
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, MAX_INITIALS)
    .join(''));
}
