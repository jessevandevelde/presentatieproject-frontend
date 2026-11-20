import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonType = 'button' | 'submit';
export type ButtonSize = 'sm' | 'md';

@Component({
  selector: 'stw-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  public readonly variant = input<ButtonVariant>('primary');

  public readonly size = input<ButtonSize>('md');

  public readonly type = input<ButtonType>('button');

  public readonly disabled = input(false);

  public readonly loading = input(false);

  public readonly fullWidth = input(false);

  public readonly formId = input<string | null>(null);

  public readonly buttonClick = output();

  protected handleClick(): void {
    if (this.disabled() || this.loading()) {
      return;
    }

    this.buttonClick.emit();
  }
}
