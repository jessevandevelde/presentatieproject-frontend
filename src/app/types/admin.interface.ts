export interface DashboardMetrics {
  readonly activeStatementCount: number
  readonly registeredPartyCount: number
}

export interface PaginatedResult<T> {
  readonly items: readonly T[]
  readonly total: number
  readonly page: number
  readonly pageSize: number
}
