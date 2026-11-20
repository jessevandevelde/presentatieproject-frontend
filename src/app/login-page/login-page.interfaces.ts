import type { UserRole } from '../services/auth.service';

export interface LoginCredentials {
  readonly email: string
  readonly password: string
  readonly rememberMe: boolean
}

export interface LoginResponseUser {
  readonly id: number
  readonly name: string
  readonly email: string
  readonly role: UserRole
  readonly partyId?: number
  readonly partyName?: string
}

export interface LoginResponse {
  readonly token: string
  readonly user: LoginResponseUser
}
