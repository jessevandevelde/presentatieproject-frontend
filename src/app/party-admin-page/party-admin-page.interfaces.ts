import type { PartyFormValue } from '../admin-page/admin-page.interfaces';
import type { Answer } from '../types/answer.interface';

export interface PartyStatementAnswer {
  readonly statementId: number
  readonly text: string
  readonly answer: Answer | null
  readonly explanation: string | null
}

export interface PartyStatementsResponse {
  readonly party: { readonly id: number, readonly name: string }
  readonly statements: readonly PartyStatementAnswer[]
}

export type PartyDetailsFormValue = Omit<PartyFormValue, 'isActive'>;

