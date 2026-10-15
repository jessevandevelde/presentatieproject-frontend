import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { AnswerSummary, MatchingResult, ProfileMatch } from '../../../types/matching.interface';

interface SpectrumPoint {
  readonly id: number
  readonly label: string
  readonly name: string
  readonly x: number
  readonly y: number
}

const PERCENT_MAX = 100;
const SPECTRUM_MIN = 20;
const SPECTRUM_MAX = 80;
const SPECTRUM_CENTER = 50;
const PROFILE_WEIGHT_EXPONENT = 3;
const MIN_ABBREVIATION_WORD_LENGTH = 2;
const MAX_ABBREVIATION_WORDS = 3;

interface ProfilePosition {
  readonly x: number
  readonly y: number
}

const PROFILE_POSITIONS = new Map<string, ProfilePosition>([
  ['Theoretisch & vernieuwend', { x: SPECTRUM_MIN, y: SPECTRUM_MIN }],
  ['Praktisch & vernieuwend', { x: SPECTRUM_MAX, y: SPECTRUM_MIN }],
  ['Theoretisch & behoudend', { x: SPECTRUM_MIN, y: SPECTRUM_MAX }],
  ['Praktisch & behoudend', { x: SPECTRUM_MAX, y: SPECTRUM_MAX }],
]);

function positionFor(match: ProfileMatch): ProfilePosition {
  return PROFILE_POSITIONS.get(match.profileName) ?? { x: SPECTRUM_CENTER, y: SPECTRUM_CENTER };
}

@Component({
  selector: 'rck-results',
  imports: [RouterLink],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsComponent {
  public readonly matchingResult = input.required<MatchingResult>();

  public readonly answerSummary = input.required<AnswerSummary>();

  public readonly restart = output();

  protected readonly bestMatch = computed(() => this.matchingResult().matches[0] ?? null);

  protected readonly otherMatches = computed(() => this.matchingResult().matches.slice(1));

  protected readonly spectrumPoints = computed<readonly SpectrumPoint[]>(() => this.matchingResult().matches.map((match) => {
    const position = positionFor(match);

    return {
      id: match.profileId,
      label: this.abbreviation(match.profileName),
      name: match.profileName,
      x: position.x,
      y: position.y,
    };
  }));

  protected readonly userPoint = computed(() => {
    const weightedMatches = this.matchingResult().matches
      .filter(match => match.matchPercentage !== null)
      .map(match => ({ match, weight: Math.pow((match.matchPercentage ?? 0) / PERCENT_MAX, PROFILE_WEIGHT_EXPONENT) }));

    const totalWeight = weightedMatches.reduce((total, item) => total + item.weight, 0);

    if (totalWeight === 0) {
      return { x: SPECTRUM_CENTER, y: SPECTRUM_CENTER };
    }

    return {
      x: weightedMatches.reduce((total, item) => total + positionFor(item.match).x * item.weight, 0) / totalWeight,
      y: weightedMatches.reduce((total, item) => total + positionFor(item.match).y * item.weight, 0) / totalWeight,
    };
  });

  protected percentage(match: ProfileMatch): number {
    return Math.round(match.matchPercentage ?? 0);
  }

  protected restartQuestionnaire(): void {
    this.restart.emit();
  }

  private abbreviation(name: string): string {
    return name
      .split(' ')
      .filter(word => word.length > MIN_ABBREVIATION_WORD_LENGTH)
      .slice(0, MAX_ABBREVIATION_WORDS)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  }
}
