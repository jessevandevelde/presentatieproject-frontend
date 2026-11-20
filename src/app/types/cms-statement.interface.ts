import type { Answer } from './answer.interface';

// Toelichting voor kiezers; elk veld kan leeg zijn zolang een beheerder het nog niet heeft ingevuld.
export interface StatementDetails {
  readonly title: string | null
  readonly theme: string | null
  readonly explanation: string | null
  readonly consequence: string | null
  readonly argumentsFor: readonly string[]
  readonly argumentsAgainst: readonly string[]
}

export interface Statement extends StatementDetails {
  readonly id: number
  readonly text: string
  readonly isActive: boolean
  readonly createdAt: string
  readonly updatedAt: string
}

export interface PartyAnswer {
  readonly partyId: number
  readonly partyName: string
  readonly abbreviation: string | null
  readonly color: string | null
  readonly answer: Answer | null
  readonly explanation: string | null
}

export interface PublicStatement extends StatementDetails {
  readonly index: number
  readonly id: number
  readonly text: string
  readonly partyAnswers: readonly PartyAnswer[]
}

export interface PartyStatementAnswer {
  readonly statementId: number
  readonly statementText: string
  readonly statementIsActive: boolean
  readonly answer: Answer | null
  readonly explanation: string | null
}

// Suggesties voor het thema-veld in het CMS; een beheerder mag ook een eigen thema typen.
export const STATEMENT_THEMES: readonly string[] = [
  'Democratie & bestuur',
  'Digitaal & privacy',
  'Economie & belastingen',
  'Europa & buitenland',
  'Gezondheidszorg',
  'Klimaat & energie',
  'Landbouw & natuur',
  'Migratie & asiel',
  'Onderwijs',
  'Veiligheid & defensie',
  'Veiligheid & rechtsstaat',
  'Verkeer & mobiliteit',
  'Werk & inkomen',
  'Wonen & huisvesting',
];
