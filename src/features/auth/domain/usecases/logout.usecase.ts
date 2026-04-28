import type { UseCase } from '@core/domain/use-case'
import type { AuthRepository } from '../repositories/auth.repository'

export class LogoutUseCase implements UseCase<void, void> {
  constructor(private readonly repository: AuthRepository) {}

  execute(): Promise<void> {
    this.repository.logout()
    return Promise.resolve()
  }
}
