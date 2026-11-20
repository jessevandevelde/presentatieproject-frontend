import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { PartyFormValue } from '../../../admin-page/admin-page.interfaces';
import { PartyFormComponent } from '../../../admin-page/components/party-editor/components/party-form/party-form.component';
import { ButtonComponent } from '../../../components/button/button.component';
import { EmptyStateComponent } from '../../../components/empty-state/empty-state.component';
import { SecurityNoticeComponent } from '../../../components/security-notice/security-notice.component';
import type { Party } from '../../../types/party.interface';
import type { PartyDetailsFormValue } from '../../party-admin-page.interfaces';

// Gebruikt hetzelfde formulier als de superadmin, zonder de keuze of de partij actief is.
@Component({
  selector: 'stw-party-details-form',
  imports: [PartyFormComponent, ButtonComponent, EmptyStateComponent, SecurityNoticeComponent],
  templateUrl: './party-details-form.component.html',
  styleUrl: './party-details-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyDetailsFormComponent {
  // null zolang de partijgegevens nog worden geladen.
  public readonly party = input<Party | null>(null);

  public readonly saving = input(false);

  public readonly saved = input(false);

  public readonly errorMessage = input<string | null>(null);

  public readonly submitDetails = output<PartyDetailsFormValue>();

  protected handleSubmit(value: PartyFormValue): void {
    this.submitDetails.emit({
      name: value.name,
      description: value.description,
      imageUrl: value.imageUrl,
      abbreviation: value.abbreviation,
      color: value.color,
      seats: value.seats,
      leader: value.leader,
    });
  }
}

