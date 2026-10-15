import type { Answer } from './answer.interface';

export interface ProfileAnswer {
  readonly profileId: number
  readonly profileName: string
  readonly answer: Answer | null
}

export interface Statement {
  readonly index: number
  readonly id: number
  readonly text: string
  readonly profileAnswers: readonly ProfileAnswer[]
}
