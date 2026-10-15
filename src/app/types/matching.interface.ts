import type { Answer } from './answer.interface';

export interface AnswerSubmission {
  readonly statementId: number
  readonly answer: Answer
}

export interface ProfileMatch {
  readonly profileId: number
  readonly profileName: string
  readonly matchPercentage: number | null
  readonly matchedAnswers: number
  readonly comparedAnswers: number
  readonly missingAnswers: number
}

export interface MatchingResult {
  readonly totalAnswers: number
  readonly matches: readonly ProfileMatch[]
}

export interface AnswerSummary {
  readonly agree: number
  readonly neutral: number
  readonly disagree: number
  readonly skipped: number
  readonly total: number
}
