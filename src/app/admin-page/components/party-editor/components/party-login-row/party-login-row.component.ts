import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import type { PartyAdminAccount } from '../../../../admin-page.interfaces';

// Eén partijbeheerdersaccount, met een tweede klik ter bevestiging voordat het wordt verwijderd.
@Component({
  selector: 'stw-party-login-row',
  templateUrl: './party-login-row.component.html',
  styleUrl: './party-login-row.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyLoginRowComponent {
  public readonly account = input.required<PartyAdminAccount>();

  public readonly busy = input(false);

  public readonly editRequested = output();

  public readonly deleteConfirmed = output();

  protected readonly confirmingDelete = signal(false);

  protected setConfirmingDelete(confirming: boolean): void {
    this.confirmingDelete.set(confirming);
  }

  protected confirmDelete(): void {
    this.confirmingDelete.set(false);
    this.deleteConfirmed.emit();
  }
}

