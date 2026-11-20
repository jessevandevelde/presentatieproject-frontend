import type { StatementDetails } from '../types/cms-statement.interface';

export type StatusFilter = 'all' | 'active' | 'inactive';

export interface StatementListFilters {
  readonly search: string
  readonly status: StatusFilter
}

export interface PartyListFilters {
  readonly search: string
}

export interface StatementFormValue extends StatementDetails {
  readonly text: string
  readonly isActive: boolean
}

export interface PartyFormValue {
  readonly name: string
  readonly description: string | null
  readonly imageUrl: string | null
  readonly abbreviation: string | null
  readonly color: string | null
  readonly seats: number | null
  readonly leader: string | null
  readonly isActive: boolean
}

export interface PartyAdminAccount {
  readonly id: number
  readonly partyId: number
  readonly name: string
  readonly email: string
  readonly createdAt: string
  readonly updatedAt: string
}

// password is null bij wijzigen zonder nieuw wachtwoord.
export interface PartyLoginFormValue {
  readonly name: string
  readonly email: string
  readonly password: string | null
}

