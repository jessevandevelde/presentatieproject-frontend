import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { DashboardMetrics } from '../../../../../types/admin.interface';
import { MetricCardComponent } from '../metric-card/metric-card.component';

@Component({
  selector: 'stw-quick-actions',
  imports: [MetricCardComponent],
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickActionsComponent {
  public readonly metrics = input.required<DashboardMetrics>();

  public readonly createStatement = output();

  public readonly createParty = output();
}

