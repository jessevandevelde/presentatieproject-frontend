import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'stw-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent {
  public readonly value = input('');

  public readonly placeholder = input('Zoeken…');

  public readonly valueChange = output<string>();

  protected handleInput(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.valueChange.emit(event.target.value);
    }
  }
}
