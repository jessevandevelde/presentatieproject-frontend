import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type StatusBadgeTone = 'blue' | 'green' | 'gray' | 'red';

@Component({
  selector: 'stw-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  public readonly tone = input<StatusBadgeTone>('gray');
}
