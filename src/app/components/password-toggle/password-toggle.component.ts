import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'stw-password-toggle',
  templateUrl: './password-toggle.component.html',
  styleUrl: './password-toggle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordToggleComponent {
  public readonly visible = input(false);

  public readonly toggleRequested = output();

  protected handleClick(): void {
    this.toggleRequested.emit();
  }
}
