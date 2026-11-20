import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, computed, input, linkedSignal } from '@angular/core';

const FALLBACK_COLOR = '#16224F';

@Component({
  selector: 'stw-party-badge',
  imports: [NgOptimizedImage],
  templateUrl: './party-badge.component.html',
  styleUrl: './party-badge.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyBadgeComponent {
  public readonly abbreviation = input<string | null>(null);

  public readonly color = input<string | null>(null);

  public readonly imageUrl = input<string | null>(null);

  protected readonly label = computed(() => {
    const abbreviation = this.abbreviation()?.trim() ?? '';

    return abbreviation === '' ? '?' : abbreviation;
  });

  // Resets to false whenever imageUrl changes, so a new URL gets a fresh try.
  protected readonly imageFailed = linkedSignal({ source: this.imageUrl, computation: () => false });

  // Sets the CSS variable --party-color on <stw-party-badge> itself; the CSS uses it for text and background.
  @HostBinding('style.--party-color')
  protected get partyColor(): string {
    return this.color() ?? FALLBACK_COLOR;
  }
}
