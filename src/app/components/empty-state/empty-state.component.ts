import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'stw-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  public readonly message = input.required<string>();
}
