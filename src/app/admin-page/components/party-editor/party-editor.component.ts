import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../components/button/button.component';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';
import { SecurityNoticeComponent } from '../../../components/security-notice/security-notice.component';
import type { PartyFormValue } from '../../admin-page.interfaces';
import { AdminPageService } from '../../admin-page.service';
import { extractErrorMessage } from '../../extract-error-message';
import { PartyAnswersComponent } from './components/party-answers/party-answers.component';
import { PartyFormComponent } from './components/party-form/party-form.component';
import { PartyLoginsComponent } from './components/party-logins/party-logins.component';

@Component({
  selector: 'stw-party-editor',
  imports: [ButtonComponent, ConfirmationDialogComponent, PartyAnswersComponent, PartyFormComponent, PartyLoginsComponent, RouterLink, SecurityNoticeComponent],
  templateUrl: './party-editor.component.html',
  styleUrl: './party-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyEditorComponent implements OnInit {
  protected readonly initialValue = signal<PartyFormValue | null>(null);

  protected readonly saving = signal(false);

  protected readonly notFound = signal(false);

  protected readonly showDeleteDialog = signal(false);

  protected readonly deleting = signal(false);

  protected readonly errorMessage = signal<string | null>(null);

  protected readonly partyId: number | null;

  protected readonly pageLabel = computed(() => {
    const party = this.initialValue();

    if (this.partyId === null) {
      return 'Nieuwe partij';
    }

    return party === null ? 'Partij bewerken' : `${party.name} bewerken`;
  });

  private readonly adminPageService = inject(AdminPageService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  public constructor() {
    const rawId = this.route.snapshot.paramMap.get('id');

    this.partyId = rawId === null ? null : Number(rawId);
  }

  public ngOnInit(): void {
    if (this.partyId === null) {
      return;
    }

    this.adminPageService.getParty(this.partyId).subscribe((party) => {
      if (party === undefined) {
        this.notFound.set(true);

        return;
      }

      this.initialValue.set({
        name: party.name,
        description: party.description,
        imageUrl: party.imageUrl,
        abbreviation: party.abbreviation,
        color: party.color,
        seats: party.seats,
        leader: party.leader,
        isActive: party.isActive,
      });
    });
  }

  protected handleSubmit(value: PartyFormValue): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    const save$ = this.partyId === null
      ? this.adminPageService.createParty(value)
      : this.adminPageService.updateParty(this.partyId, value);

    // Na het aanmaken blijft de superadmin op de partij, zodat er direct inloggegevens kunnen worden toegevoegd.
    save$.subscribe({
      next: (party) => {
        this.saving.set(false);

        if (this.partyId === null) {
          void this.router.navigate(['/admin/partijen', party.id]);

          return;
        }

        this.goToPartyList();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }

  protected handleCancel(): void {
    this.goToPartyList();
  }

  protected requestDeletion(): void {
    this.showDeleteDialog.set(true);
  }

  protected cancelDeletion(): void {
    this.showDeleteDialog.set(false);
  }

  protected confirmDeletion(): void {
    if (this.partyId === null) {
      return;
    }

    this.showDeleteDialog.set(false);
    this.deleting.set(true);
    this.errorMessage.set(null);

    this.adminPageService.deleteParty(this.partyId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.goToPartyList();
      },
      error: (error: unknown) => {
        this.deleting.set(false);
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }

  private goToPartyList(): void {
    void this.router.navigate(['/admin'], { fragment: 'partijen-panel' });
  }
}

