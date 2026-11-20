import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { SecurityNoticeComponent } from '../../../../../components/security-notice/security-notice.component';
import type { PartyAdminAccount, PartyLoginFormValue } from '../../../../admin-page.interfaces';
import { AdminPageService } from '../../../../admin-page.service';
import { extractErrorMessage } from '../../../../extract-error-message';
import { PartyLoginFormComponent } from '../party-login-form/party-login-form.component';
import { PartyLoginRowComponent } from '../party-login-row/party-login-row.component';

// Inloggegevens waarmee partijbeheerders op /partij de standpunten en gegevens van deze partij beheren.
@Component({
  selector: 'stw-party-logins',
  imports: [ButtonComponent, PartyLoginFormComponent, PartyLoginRowComponent, SecurityNoticeComponent],
  templateUrl: './party-logins.component.html',
  styleUrl: './party-logins.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyLoginsComponent {
  public readonly partyId = input.required<number | null>();

  protected readonly accounts = signal<readonly PartyAdminAccount[]>([]);

  protected readonly loading = signal(true);

  protected readonly errorMessage = signal<string | null>(null);

  protected readonly successMessage = signal<string | null>(null);

  protected readonly editingId = signal<number | null>(null);

  protected readonly adding = signal(false);

  // 0 staat voor het formulier van een nieuw account.
  protected readonly busyId = signal<number | null>(null);

  protected readonly ready = computed(() => this.partyId() !== null && !this.loading());

  protected readonly hint = computed(() => {
    if (this.partyId() === null) {
      return 'Sla de partij eerst op; daarna kun je hier inloggegevens aanmaken.';
    }

    if (this.loading()) {
      return 'Inloggegevens laden…';
    }

    return this.accounts().length === 0
      ? 'Deze partij heeft nog geen inloggegevens.'
      : 'Partijbeheerders loggen in via de gewone loginpagina en kunnen alleen deze partij beheren.';
  });

  private readonly adminPageService = inject(AdminPageService);

  public constructor() {
    effect(() => {
      const partyId = this.partyId();

      if (partyId !== null) {
        this.load(partyId);
      }
    });
  }

  protected startAdding(): void {
    this.editingId.set(null);
    this.adding.set(true);
    this.successMessage.set(null);
  }

  protected startEditing(account: PartyAdminAccount): void {
    this.adding.set(false);
    this.editingId.set(account.id);
    this.successMessage.set(null);
  }

  protected closeForms(): void {
    this.adding.set(false);
    this.editingId.set(null);
  }

  protected handleCreate(value: PartyLoginFormValue): void {
    const partyId = this.partyId();

    if (partyId === null) {
      return;
    }

    this.startSaving(0);
    this.adminPageService.createPartyAdmin(partyId, value).subscribe({
      next: (account) => {
        this.accounts.update(accounts => [...accounts, account]);
        this.finishSaving(`Account voor ${account.email} aangemaakt.`);
      },
      error: (error: unknown) => {
        this.failSaving(error);
      },
    });
  }

  protected handleUpdate(account: PartyAdminAccount, value: PartyLoginFormValue): void {
    this.startSaving(account.id);
    this.adminPageService.updatePartyAdmin(account.id, value).subscribe({
      next: (saved) => {
        this.accounts.update(accounts => accounts.map(item => (item.id === saved.id ? saved : item)));
        this.finishSaving(value.password === null
          ? `Account van ${saved.email} bijgewerkt.`
          : `Account van ${saved.email} bijgewerkt; de partijbeheerder moet opnieuw inloggen met het nieuwe wachtwoord.`);
      },
      error: (error: unknown) => {
        this.failSaving(error);
      },
    });
  }

  protected handleDelete(account: PartyAdminAccount): void {
    this.startSaving(account.id);
    this.adminPageService.deletePartyAdmin(account.id).subscribe({
      next: () => {
        this.accounts.update(accounts => accounts.filter(item => item.id !== account.id));
        this.finishSaving(`Account van ${account.email} verwijderd.`);
      },
      error: (error: unknown) => {
        this.failSaving(error);
      },
    });
  }

  private load(partyId: number): void {
    this.loading.set(true);
    this.adminPageService.listPartyAdmins(partyId).subscribe({
      next: (accounts) => {
        this.accounts.set(accounts);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }

  private startSaving(id: number): void {
    this.busyId.set(id);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  private finishSaving(message: string): void {
    this.busyId.set(null);
    this.closeForms();
    this.successMessage.set(message);
  }

  private failSaving(error: unknown): void {
    this.busyId.set(null);
    this.errorMessage.set(extractErrorMessage(error));
  }
}

