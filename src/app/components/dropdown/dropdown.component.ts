import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface DropdownOption {
  readonly value: string
  readonly label: string
}

@Component({
  selector: 'stw-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent {
  public readonly options = input.required<readonly DropdownOption[]>();

  public readonly value = input.required<string>();

  public readonly ariaLabel = input('Filter');

  public readonly valueChange = output<string>();

  protected handleChange(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      this.valueChange.emit(event.target.value);
    }
  }
}
