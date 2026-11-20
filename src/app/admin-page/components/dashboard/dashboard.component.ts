import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';
import { SecurityNoticeComponent } from '../../../components/security-notice/security-notice.component';
import type { DashboardMetrics, PaginatedResult } from '../../../types/admin.interface';
import type { Party } from '../../../types/party.interface';
import type { Statement } from '../../../types/cms-statement.interface';
import type { PartyListFilters, StatementListFilters, StatusFilter } from '../../admin-page.interfaces';
import { AdminPageService } from '../../admin-page.service';
import { extractErrorMessage } from '../../extract-error-message';
import { PartiesTableComponent } from './components/parties-table/parties-table.component';
import { QuickActionsComponent } from './components/quick-actions/quick-actions.component';
import { StatementsTableComponent } from './components/statements-table/statements-table.component';

const PAGE_SIZE = 5;

interface PendingDeletion {
  readonly type: 'statement' | 'party'
  readonly id: number
  readonly label: string
}

function emptyResult<T>(pageSize: number): PaginatedResult<T> {
  return { items: [], total: 0, page: 1, pageSize };
}

@Component({
  selector: 'stw-dashboard',
  imports: [ConfirmationDialogComponent, PartiesTableComponent, QuickActionsComponent, SecurityNoticeComponent, StatementsTableComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  protected readonly metrics = signal<DashboardMetrics>({ activeStatementCount: 0, registeredPartyCount: 0 });

  protected readonly statementsResult = signal<PaginatedResult<Statement>>(emptyResult(PAGE_SIZE));

  protected readonly partiesResult = signal<PaginatedResult<Party>>(emptyResult(PAGE_SIZE));

  protected readonly statementsLoading = signal(true);

  protected readonly partiesLoading = signal(true);

  protected readonly statementFilters = signal<StatementListFilters>({ search: '', status: 'all' });

  protected readonly statementPage = signal(1);

  protected readonly partyFilters = signal<PartyListFilters>({ search: '' });

  protected readonly partyPage = signal(1);

  protected readonly pendingDeletion = signal<PendingDeletion | null>(null);

  protected readonly errorMessage = signal<string | null>(null);

  private readonly adminPageService = inject(AdminPageService);

  private readonly router = inject(Router);

  public ngOnInit(): void {
    this.loadMetrics();
    this.loadStatements();
    this.loadParties();
  }

  protected handleStatementSearchChange(search: string): void {
    this.statementFilters.update(filters => ({ ...filters, search }));
    this.statementPage.set(1);
    this.loadStatements();
  }

  protected handleStatementStatusChange(status: StatusFilter): void {
    this.statementFilters.update(filters => ({ ...filters, status }));
    this.statementPage.set(1);
    this.loadStatements();
  }

  protected handleStatementPageChange(page: number): void {
    this.statementPage.set(page);
    this.loadStatements();
  }

  protected handlePartySearchChange(search: string): void {
    this.partyFilters.set({ search });
    this.partyPage.set(1);
    this.loadParties();
  }

  protected handlePartyPageChange(page: number): void {
    this.partyPage.set(page);
    this.loadParties();
  }

  protected navigateToNewStatement(): void {
    void this.router.navigate(['/admin/stellingen/nieuw']);
  }

  protected navigateToEditStatement(id: number): void {
    void this.router.navigate(['/admin/stellingen', id]);
  }

  protected navigateToNewParty(): void {
    void this.router.navigate(['/admin/partijen/nieuw']);
  }

  protected navigateToEditParty(id: number): void {
    void this.router.navigate(['/admin/partijen', id]);
  }

  protected requestStatementDeletion(id: number): void {
    const statement = this.statementsResult().items.find(item => item.id === id);

    if (statement === undefined) {
      return;
    }

    this.pendingDeletion.set({ type: 'statement', id, label: `stelling #${statement.id}` });
  }

  protected requestPartyDeletion(id: number): void {
    const party = this.partiesResult().items.find(item => item.id === id);

    if (party === undefined) {
      return;
    }

    this.pendingDeletion.set({ type: 'party', id, label: `partij ${party.name}` });
  }

  protected cancelDeletion(): void {
    this.pendingDeletion.set(null);
  }

  protected confirmDeletion(): void {
    const pending = this.pendingDeletion();

    if (pending === null) {
      return;
    }

    this.errorMessage.set(null);

    const deletion$ = pending.type === 'statement'
      ? this.adminPageService.deleteStatement(pending.id)
      : this.adminPageService.deleteParty(pending.id);

    deletion$.subscribe({
      next: () => {
        this.pendingDeletion.set(null);
        this.loadMetrics();

        if (pending.type === 'statement') {
          this.loadStatements();
        }
        else {
          this.loadParties();
        }
      },
      error: (error: unknown) => {
        this.pendingDeletion.set(null);
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }

  private loadMetrics(): void {
    this.adminPageService.getDashboardMetrics().subscribe({
      next: (metrics) => {
        this.metrics.set(metrics);
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }

  private loadStatements(): void {
    this.statementsLoading.set(true);

    this.adminPageService.getStatements(this.statementFilters(), this.statementPage(), PAGE_SIZE).subscribe({
      next: (result) => {
        this.statementsResult.set(result);
        this.statementsLoading.set(false);
      },
      error: (error: unknown) => {
        this.statementsLoading.set(false);
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }

  private loadParties(): void {
    this.partiesLoading.set(true);

    this.adminPageService.getParties(this.partyFilters(), this.partyPage(), PAGE_SIZE).subscribe({
      next: (result) => {
        this.partiesResult.set(result);
        this.partiesLoading.set(false);
      },
      error: (error: unknown) => {
        this.partiesLoading.set(false);
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }
}

