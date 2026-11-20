import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'stw-brand-mark',
  templateUrl: './brand-mark.component.html',
  styleUrl: './brand-mark.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandMarkComponent {
  public readonly heading = input.required<string>();
}
