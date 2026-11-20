import { HttpErrorResponse } from '@angular/common/http';
import type { OnInit, WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminHeaderComponent } from '../admin-page/components/admin-header/admin-header.component';
import { extractErrorMessage } from '../admin-page/extract-error-message';
import { EmptyStateComponent } from '../components/empty-state/empty-state.component';
import { SecurityNoticeComponent } from '../components/security-notice/security-notice.component';
import { AuthService } from '../services/auth.service';
import type { Answer } from '../types/answer.interface';
import type { Party } from '../types/party.interface';
import { PartyDetailsFormComponent } from './components/party-details-form/party-details-form.component';
import { PartyStatementRowComponent } from './components/party-statement-row/party-statement-row.component';
import type { PartyDetailsFormValue, PartyStatementAnswer } from './party-admin-page.interfaces';
import { PartyAdminPageService } from './party-admin-page.service';

const UNAUTHORIZED_STATUS = 401;

@Component({
  selector: 'stw-party-admin-page',
  imports: [AdminHeaderComponent, EmptyStateComponent, PartyDetailsFormComponent, PartyStatementRowComponent, SecurityNoticeComponent],
  templateUrl: './party-admin-page.component.html',
  styleUrl: './party-admin-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyAdminPageComponent implements OnInit {
  protected readonly statements = signal<readonly PartyStatementAnswer[]>([]);

  protected readonly loading = signal(true);

  protected readonly savingStatementId = signal<number | null>(null);

  protected readonly errorMessage = signal<string | null>(null);

  protected readonly answeredCount = computed(() => this.statements().filter(statement => statement.answer !== null).length);

  protected readonly party = signal<Party | null>(null);

  protected readonly savingDetails = signal(false);

  protected readonly detailsSaved = signal(false);

  protected readonly detailsErrorMessage = signal<string | null>(null);

  protected readonly partyName = computed(() => this.party()?.name ?? this.sessionPartyName);

  protected readonly userEmail: string;

  protected readonly userName: string;

  private readonly sessionPartyName: string;

  private readonly authService = inject(AuthService);

  private readonly partyAdminPageService = inject(PartyAdminPageService);

  private readonly router = inject(Router);

  public constructor() {
    const session = this.authService.getSession();

    this.userEmail = session?.email ?? '';
    this.userName = session?.name ?? 'Partijbeheerder';
    this.sessionPartyName = session?.partyName ?? '';
  }

  public ngOnInit(): void {
    this.partyAdminPageService.getParty().subscribe({
      next: (party) => {
        this.party.set(party);
      },
      error: (error: unknown) => {
        this.handleError(error, this.detailsErrorMessage);
      },
    });

    this.partyAdminPageService.listStatements().subscribe({
      next: (response) => {
        this.statements.set(response.statements);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.handleError(error, this.errorMessage);
      },
    });
  }

  protected handleSaveDetails(value: PartyDetailsFormValue): void {
    this.savingDetails.set(true);
    this.detailsSaved.set(false);
    this.detailsErrorMessage.set(null);

    this.partyAdminPageService.updateParty(value).subscribe({
      next: (party) => {
        this.party.set(party);
        this.authService.updatePartyName(party.name);
        this.savingDetails.set(false);
        this.detailsSaved.set(true);
      },
      error: (error: unknown) => {
        this.savingDetails.set(false);
        this.handleError(error, this.detailsErrorMessage);
      },
    });
  }

  protected handleAnswer(statement: PartyStatementAnswer, answer: Answer): void {
    if (statement.answer === answer) {
      return;
    }

    this.saveAnswer(statement, answer);
  }

  protected handleExplanation(statement: PartyStatementAnswer, explanation: string | null): void {
    if (statement.answer !== null) {
      this.saveAnswer(statement, statement.answer, explanation);
    }
  }

  protected handleLogout(): void {
    this.authService.endSession();
    void this.router.navigateByUrl('/login');
  }

  private saveAnswer(statement: PartyStatementAnswer, answer: Answer, explanation?: string | null): void {
    if (this.savingStatementId() !== null) {
      return;
    }

    this.savingStatementId.set(statement.statementId);
    this.errorMessage.set(null);

    this.partyAdminPageService.setAnswer(statement.statementId, answer, explanation).subscribe({
      next: (saved) => {
        this.statements.update(statements => statements.map(item => (item.statementId === saved.statementId ? saved : item)));
        this.savingStatementId.set(null);
      },
      error: (error: unknown) => {
        this.savingStatementId.set(null);
        this.handleError(error, this.errorMessage);
      },
    });
  }

  // Een verlopen of ongeldig token stuurt de gebruiker terug naar de loginpagina.
  private handleError(error: unknown, message: WritableSignal<string | null>): void {
    if (error instanceof HttpErrorResponse && error.status === UNAUTHORIZED_STATUS) {
      this.handleLogout();

      return;
    }

    message.set(extractErrorMessage(error));
  }
}

