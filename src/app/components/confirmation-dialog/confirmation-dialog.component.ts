import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'stw-confirmation-dialog',
  imports: [ButtonComponent],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  public readonly title = input.required<string>();

  public readonly message = input.required<string>();

  public readonly confirmLabel = input('Verwijderen');

  public readonly cancelLabel = input('Annuleren');

  public readonly confirmed = output();

  public readonly cancelled = output();
}
