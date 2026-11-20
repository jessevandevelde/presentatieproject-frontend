export type EconomicPosition = 'links' | 'midden' | 'rechts';

export type SocialPosition = 'progressief' | 'midden' | 'conservatief';

export interface Party {
  readonly id: number
  readonly name: string
  readonly description: string | null
  readonly imageUrl: string | null
  readonly abbreviation: string | null
  readonly color: string | null
  readonly seats: number | null
  readonly leader: string | null
  readonly economicPosition: EconomicPosition | null
  readonly socialPosition: SocialPosition | null
  readonly isActive: boolean
  readonly createdAt: string
  readonly updatedAt: string
}
