import type { UseCase } from '@core/domain/use-case'
import type { LoginCredentials, LoginResult } from '../models/credentials.model'
import type { AuthRepository } from '../repositories/auth.repository'

export class LoginUseCase implements UseCase<LoginCredentials, LoginResult> {
  constructor(private readonly repository: AuthRepository) {}

  execute(credentials: LoginCredentials): Promise<LoginResult> {
    return this.repository.login(credentials)
  }
}
