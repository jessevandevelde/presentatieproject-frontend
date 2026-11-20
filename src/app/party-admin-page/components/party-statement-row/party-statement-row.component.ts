import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import type { Answer } from '../../../types/answer.interface';
import type { PartyStatementAnswer } from '../../party-admin-page.interfaces';

const MAX_EXPLANATION_LENGTH = 1000;

interface AnswerOption {
  readonly value: Answer
  readonly label: string
}

// Eén stelling op /partij: standpunt kiezen en de uitleg die kiezers bij dat standpunt zien.
@Component({
  selector: 'stw-party-statement-row',
  templateUrl: './party-statement-row.component.html',
  styleUrl: './party-statement-row.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyStatementRowComponent {
  public readonly statement = input.required<PartyStatementAnswer>();

  public readonly busy = input(false);

  public readonly answerChosen = output<Answer>();

  public readonly explanationSaved = output<string | null>();

  protected readonly answerOptions: readonly AnswerOption[] = [
    { value: 'eens', label: 'Eens' },
    { value: 'neutraal', label: 'Neutraal' },
    { value: 'oneens', label: 'Oneens' },
  ];

  protected readonly maxLength = MAX_EXPLANATION_LENGTH;

  protected readonly editing = signal(false);

  protected readonly draft = signal('');

  protected startEditing(): void {
    this.draft.set(this.statement().explanation ?? '');
    this.editing.set(true);
  }

  protected updateDraft(event: Event): void {
    if (event.target instanceof HTMLTextAreaElement) {
      this.draft.set(event.target.value);
    }
  }

  protected cancelEditing(): void {
    this.editing.set(false);
  }

  protected saveExplanation(): void {
    const trimmed = this.draft().trim();

    this.editing.set(false);
    this.explanationSaved.emit(trimmed === '' ? null : trimmed);
  }

  protected explanationAction(): string {
    return this.statement().explanation === null ? '+ Uitleg toevoegen' : 'Uitleg bewerken';
  }
}

