import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type SecurityNoticeVariant = 'info' | 'error';

@Component({
  selector: 'stw-security-notice',
  templateUrl: './security-notice.component.html',
  styleUrl: './security-notice.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecurityNoticeComponent {
  public readonly variant = input<SecurityNoticeVariant>('info');
}
