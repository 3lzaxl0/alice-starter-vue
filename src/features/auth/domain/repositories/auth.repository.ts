import type { LoginCredentials, LoginResult } from '../models/credentials.model'

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<LoginResult>
  logout(): void
}
