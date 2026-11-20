import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { EmptyStateComponent } from '../../../../../components/empty-state/empty-state.component';
import { SecurityNoticeComponent } from '../../../../../components/security-notice/security-notice.component';
import type { Answer } from '../../../../../types/answer.interface';
import type { PartyStatementAnswer } from '../../../../../types/cms-statement.interface';
import { AdminPageService } from '../../../../admin-page.service';
import { extractErrorMessage } from '../../../../extract-error-message';

const PAGE_SIZE = 5;

interface AnswerOption {
  readonly value: Answer
  readonly label: string
}

@Component({
  selector: 'stw-party-answers',
  imports: [EmptyStateComponent, SecurityNoticeComponent],
  templateUrl: './party-answers.component.html',
  styleUrl: './party-answers.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyAnswersComponent implements OnInit {
  public readonly partyId = input.required<number | null>();

  protected readonly answerOptions: readonly AnswerOption[] = [
    { value: 'eens', label: 'Eens' },
    { value: 'neutraal', label: 'Geen van beide' },
    { value: 'oneens', label: 'Oneens' },
  ];

  protected readonly answers = signal<readonly PartyStatementAnswer[]>([]);

  protected readonly loading = signal(true);

  protected readonly savingStatementIds = signal<ReadonlySet<number>>(new Set());

  protected readonly errorMessage = signal<string | null>(null);

  protected readonly page = signal(1);

  protected readonly emptyMessage = computed(() => {
    if (this.partyId() === null) {
      return 'Sla de partij eerst op om standpunten in te vullen.';
    }

    if (this.loading()) {
      return 'Standpunten laden…';
    }

    return this.answers().length === 0 ? 'Er zijn nog geen stellingen om standpunten op in te vullen.' : null;
  });

  protected readonly answeredCount = computed(() => this.answers().filter(item => item.answer !== null).length);

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.answers().length / PAGE_SIZE)));

  protected readonly visibleAnswers = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;

    return this.answers().slice(start, start + PAGE_SIZE);
  });

  protected readonly rangeLabel = computed(() => {
    const total = this.answers().length;
    const start = (this.page() - 1) * PAGE_SIZE;

    return `${String(Math.min(start + 1, total))} - ${String(Math.min(start + PAGE_SIZE, total))} van ${String(total)}`;
  });

  private readonly adminPageService = inject(AdminPageService);

  public ngOnInit(): void {
    const partyId = this.partyId();

    if (partyId === null) {
      return;
    }

    this.adminPageService.getPartyAnswers(partyId).subscribe({
      next: (answers) => {
        this.answers.set(answers);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }

  protected isSaving(statementId: number): boolean {
    return this.savingStatementIds().has(statementId);
  }

  protected selectAnswer(item: PartyStatementAnswer, answer: Answer): void {
    const partyId = this.partyId();

    if (partyId === null || this.isSaving(item.statementId)) {
      return;
    }

    const nextAnswer = item.answer === answer ? null : answer;

    this.errorMessage.set(null);
    this.replaceAnswer(item.statementId, nextAnswer);
    this.setSaving(item.statementId, true);

    this.adminPageService.setPartyAnswer(partyId, item.statementId, nextAnswer).subscribe({
      next: (saved) => {
        this.replaceAnswer(saved.statementId, saved.answer);
        this.setSaving(item.statementId, false);
      },
      error: (error: unknown) => {
        this.replaceAnswer(item.statementId, item.answer);
        this.setSaving(item.statementId, false);
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }

  protected goToPreviousPage(): void {
    this.page.update(page => Math.max(1, page - 1));
  }

  protected goToNextPage(): void {
    this.page.update(page => Math.min(this.totalPages(), page + 1));
  }

  private replaceAnswer(statementId: number, answer: Answer | null): void {
    this.answers.update(items => items.map(item => (item.statementId === statementId ? { ...item, answer } : item)));
  }

  private setSaving(statementId: number, saving: boolean): void {
    this.savingStatementIds.update((ids) => {
      const next = new Set(ids);

      if (saving) {
        next.add(statementId);
      }
      else {
        next.delete(statementId);
      }

      return next;
    });
  }
}

