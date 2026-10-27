import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import type { OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Subscription } from 'rxjs';
import type { VisualizationPoint } from '../types/visualization.interface';
import { VisualizationPageService } from './visualization-page.service';

interface PlotPoint extends VisualizationPoint {
  readonly color: string
  readonly plotX: number
  readonly plotY: number
}

const plotMinimum = 10;
const plotSize = 80;
const coordinateRange = 200;
const coordinateMaximum = 100;
const newPointAnimationMs = 1800;
const minimumPointOpacity = 0.16;
const maximumPointOpacity = 0.72;
const opacityDensityFactor = 18;
const hueStep = 137.508;
const hueMaximum = 360;
const saturationMinimum = 68;
const saturationSteps = 3;
const saturationStep = 6;
const lightnessMinimum = 40;
const lightnessSteps = 4;
const lightnessStep = 4;

const pointColor = (index: number): string => {
  const hue = index * hueStep % hueMaximum;
  const saturation = saturationMinimum + index % saturationSteps * saturationStep;
  const lightness = lightnessMinimum + index % lightnessSteps * lightnessStep;

  return `hsl(${hue.toFixed(1)}deg ${String(saturation)}% ${String(lightness)}%)`;
};

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

  protected readonly plotPoints = computed<readonly PlotPoint[]>(() => this.points().map((point, index) => ({
    ...point,
    color: pointColor(index),
    plotX: plotMinimum + (point.x + coordinateMaximum) / coordinateRange * plotSize,
    plotY: plotMinimum + (coordinateMaximum - point.y) / coordinateRange * plotSize,
  })));

  protected readonly pointOpacity = computed(() => Math.max(
    minimumPointOpacity,
    Math.min(maximumPointOpacity, opacityDensityFactor / Math.sqrt(Math.max(this.total(), 1))),
  ));

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
