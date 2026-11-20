import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../../../../components/button/button.component';

@Component({
  selector: 'stw-metric-card',
  imports: [ButtonComponent],
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardComponent {
  public readonly label = input.required<string>();

  public readonly value = input.required<number>();

  public readonly unit = input.required<string>();

  public readonly actionLabel = input.required<string>();

  public readonly actionClicked = output();
}

