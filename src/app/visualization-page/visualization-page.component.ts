import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import type { OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Subscription } from 'rxjs';
import type { VisualizationPoint } from '../types/visualization.interface';
import { VisualizationPageService } from './visualization-page.service';

interface PlotPoint extends VisualizationPoint {
  readonly plotX: number
  readonly plotY: number
}

interface HeatCell {
  readonly count: number
  readonly opacity: number
  readonly x: number
  readonly y: number
}

const plotMinimum = 10;
const plotSize = 80;
const coordinateRange = 200;
const coordinateMaximum = 100;
const heatGridSize = 10;
const heatCellSize = plotSize / heatGridSize;
const newPointAnimationMs = 1800;
const minimumPointOpacity = 0.16;
const maximumPointOpacity = 0.72;
const opacityDensityFactor = 18;
const minimumHeatOpacity = 0.08;
const heatOpacityRange = 0.3;

@Component({
  selector: 'rck-visualization-page',
  imports: [RouterLink],
  templateUrl: './visualization-page.component.html',
  styleUrl: './visualization-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualizationPageComponent implements OnInit, OnDestroy {
  protected readonly points = signal<readonly VisualizationPoint[]>([]);

  protected readonly connected = signal(false);

  protected readonly receivedSnapshot = signal(false);

  protected readonly latestPointId = signal<string | null>(null);

  protected readonly total = computed(() => this.points().length);

  protected readonly plotPoints = computed<readonly PlotPoint[]>(() => this.points().map(point => ({
    ...point,
    plotX: plotMinimum + (point.x + coordinateMaximum) / coordinateRange * plotSize,
    plotY: plotMinimum + (coordinateMaximum - point.y) / coordinateRange * plotSize,
  })));

  protected readonly pointOpacity = computed(() => Math.max(
    minimumPointOpacity,
    Math.min(maximumPointOpacity, opacityDensityFactor / Math.sqrt(Math.max(this.total(), 1))),
  ));

  protected readonly heatCells = computed<readonly HeatCell[]>(() => {
    const counts = new Map<string, number>();

    for (const point of this.plotPoints()) {
      const column = Math.min(heatGridSize - 1, Math.max(0, Math.floor((point.plotX - plotMinimum) / heatCellSize)));
      const row = Math.min(heatGridSize - 1, Math.max(0, Math.floor((point.plotY - plotMinimum) / heatCellSize)));
      const key = `${String(column)}:${String(row)}`;

      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const maximum = Math.max(1, ...counts.values());

    return [...counts.entries()].map(([key, count]) => {
      const [columnText, rowText] = key.split(':');
      const column = Number(columnText);
      const row = Number(rowText);

      return {
        count,
        opacity: minimumHeatOpacity + count / maximum * heatOpacityRange,
        x: plotMinimum + column * heatCellSize,
        y: plotMinimum + row * heatCellSize,
      };
    });
  });

  private readonly service = inject(VisualizationPageService);

  private subscription: Subscription | null = null;

  private animationTimer: number | null = null;

  public ngOnInit(): void {
    this.subscription = this.service.connect().subscribe((message) => {
      if (message.type === 'connection') {
        this.connected.set(message.connected);

        return;
      }

      if (message.type === 'snapshot') {
        this.points.set(this.uniquePoints(message.points));
        this.receivedSnapshot.set(true);

        return;
      }

      if (!this.points().some(point => point.id === message.point.id)) {
        this.points.update(points => [...points, message.point]);
        this.animatePoint(message.point.id);
      }
    });
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();

    if (this.animationTimer !== null) {
      window.clearTimeout(this.animationTimer);
    }
  }

  private animatePoint(id: string): void {
    this.latestPointId.set(id);

    if (this.animationTimer !== null) {
      window.clearTimeout(this.animationTimer);
    }

    this.animationTimer = window.setTimeout(() => {
      if (this.latestPointId() === id) {
        this.latestPointId.set(null);
      }
    }, newPointAnimationMs);
  }

  private uniquePoints(points: readonly VisualizationPoint[]): readonly VisualizationPoint[] {
    return [...new Map(points.map(point => [point.id, point])).values()];
  }
}
