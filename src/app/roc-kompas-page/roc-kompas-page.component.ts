import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Answer } from '../types/answer.interface';
import type { AnswerSummary, MatchingResult } from '../types/matching.interface';
import type { Statement } from '../types/statement.interface';
import { ResultsComponent } from './components/results/results.component';
import { RocKompasPageService } from './roc-kompas-page.service';

const TOTAL_STATEMENTS = 30;
const FEEDBACK_DURATION_MS = 1800;
const PROGRESS_MAX = 100;

const TOPICS: readonly { readonly keywords: readonly string[], readonly label: string }[] = [
  { keywords: ['vakkennis', 'theorie', 'vakinhoud', 'kennistoets'], label: 'Vakkennis van studenten' },
  { keywords: ['werkhouding', 'werknemersvaardigheden', 'afspraken', 'fouten'], label: 'Houding & werknemersvaardigheden' },
  { keywords: ['communicatie', 'samenwerken', 'team', 'gesprek'], label: 'Communicatie & samenwerking' },
  { keywords: ['zelfstandig', 'zelfstandigheid', 'stappenplan', 'oplossing'], label: 'Zelfstandigheid' },
  { keywords: ['bpv', 'stage', 'praktijkbegeleider', 'portfolio'], label: 'Begeleiding tijdens de stage (BPV)' },
  { keywords: ['bedrijf en school', 'leerbedrijf', 'school en bedrijf'], label: 'Contact tussen bedrijf en school' },
  { keywords: ['werkveld', 'beroepspraktijk', 'docenten'], label: 'Aansluiting op het werkveld' },
  { keywords: ['ai', 'nieuwe technieken', 'innovatie'], label: 'Nieuwe technieken, zoals AI' },
];

@Component({
  selector: 'rck-roc-kompas-page',
  imports: [ResultsComponent, RouterLink],
  templateUrl: './roc-kompas-page.component.html',
  styleUrl: './roc-kompas-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RocKompasPageComponent implements OnInit {
  protected readonly currentIndex = signal(0);

  protected readonly statement = signal<Statement | null>(null);

  protected readonly loading = signal(true);

  protected readonly errorMessage = signal<string | null>(null);

  protected readonly explanationVisible = signal(false);

  protected readonly profilesVisible = signal(false);

  protected readonly feedbackMessage = signal<string | null>(null);

  protected readonly submittingResults = signal(false);

  protected readonly matchingError = signal<string | null>(null);

  protected readonly matchingResult = signal<MatchingResult | null>(null);

  protected readonly totalStatements = TOTAL_STATEMENTS;

  protected readonly progressLabel = computed(() => `${this.currentIndex() + 1} van ${TOTAL_STATEMENTS}`);

  protected readonly progressEnd = computed(() => ((this.currentIndex() + 1) / TOTAL_STATEMENTS) * PROGRESS_MAX);

  protected readonly topicTitle = computed(() => {
    const statementText = this.statement()?.text.toLowerCase() ?? '';
    const topic = TOPICS.find(item => item.keywords.some(keyword => statementText.includes(keyword)));

    return topic?.label ?? 'Leren & werken';
  });

  protected readonly answerSummary = computed<AnswerSummary>(() => {
    this.answerRevision();

    const values = [...this.answers.values()];
    const skipped = this.skippedStatementIds.size;

    return {
      agree: values.filter(answer => answer === 'eens').length,
      neutral: values.filter(answer => answer === 'neutraal').length - skipped,
      disagree: values.filter(answer => answer === 'oneens').length,
      skipped,
      total: TOTAL_STATEMENTS,
    };
  });

  private readonly service = inject(RocKompasPageService);

  private readonly answers = new Map<number, Answer>();

  private readonly skippedStatementIds = new Set<number>();

  private readonly answerRevision = signal(0);

  private submissionId = crypto.randomUUID();

  public ngOnInit(): void {
    this.loadStatement(0);
  }

  protected goBack(): void {
    const previousIndex = this.currentIndex() - 1;

    if (previousIndex >= 0) {
      this.loadStatement(previousIndex);
    }
  }

  protected recordAnswer(answer: Answer | null): void {
    const currentStatement = this.statement();

    if (currentStatement === null) {
      return;
    }

    if (answer === null) {
      this.answers.set(currentStatement.id, 'neutraal');
      this.skippedStatementIds.add(currentStatement.id);
      this.showFeedback('Stelling overgeslagen');
    }
    else {
      this.answers.set(currentStatement.id, answer);
      this.skippedStatementIds.delete(currentStatement.id);
      this.showFeedback(this.feedbackFor(answer));
    }

    this.answerRevision.update(revision => revision + 1);

    const nextIndex = this.currentIndex() + 1;

    if (nextIndex < TOTAL_STATEMENTS) {
      this.loadStatement(nextIndex);

      return;
    }

    this.submitMatching();
  }

  protected retry(): void {
    this.loadStatement(this.currentIndex());
  }

  protected retryMatching(): void {
    this.submitMatching();
  }

  protected restartQuestionnaire(): void {
    this.answers.clear();
    this.skippedStatementIds.clear();
    this.answerRevision.update(revision => revision + 1);
    this.matchingResult.set(null);
    this.matchingError.set(null);
    this.feedbackMessage.set(null);
    this.submissionId = crypto.randomUUID();
    this.loadStatement(0);
  }

  protected toggleExplanation(): void {
    this.explanationVisible.update(visible => !visible);
    this.profilesVisible.set(false);
  }

  protected toggleProfiles(): void {
    this.profilesVisible.update(visible => !visible);
    this.explanationVisible.set(false);
  }

  protected profileNames(answer: Answer): string {
    const names = this.statement()?.profileAnswers
      .filter(profileAnswer => profileAnswer.answer === answer)
      .map(profileAnswer => profileAnswer.profileName) ?? [];

    return names.length > 0 ? names.join(', ') : 'Nog geen profielantwoorden';
  }

  private loadStatement(index: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.explanationVisible.set(false);
    this.profilesVisible.set(false);

    this.service.getStatement(index).subscribe({
      next: (statement) => {
        this.currentIndex.set(index);
        this.statement.set(statement);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('De stelling kon niet worden geladen. Controleer de verbinding en probeer het opnieuw.');
      },
    });
  }

  private feedbackFor(answer: Answer): string {
    if (answer === 'eens') {
      return 'Eens geregistreerd';
    }

    if (answer === 'neutraal') {
      return 'Geen van beide gekozen';
    }

    return 'Oneens geregistreerd';
  }

  private submitMatching(): void {
    const answers = [...this.answers.entries()].map(([statementId, answer]) => ({ statementId, answer }));

    this.submittingResults.set(true);
    this.matchingError.set(null);

    this.service.getMatchingResults(answers, this.submissionId).subscribe({
      next: (result) => {
        this.submittingResults.set(false);
        this.matchingResult.set(result);
      },
      error: () => {
        this.submittingResults.set(false);
        this.matchingError.set('De uitslag kon niet worden berekend. Probeer het opnieuw.');
      },
    });
  }

  private showFeedback(message: string): void {
    this.feedbackMessage.set(message);

    window.setTimeout(() => {
      if (this.feedbackMessage() === message) {
        this.feedbackMessage.set(null);
      }
    }, FEEDBACK_DURATION_MS);
  }
}
