import { jwtDecode } from 'jwt-decode'
import type { AuthRepository } from '../../domain/repositories/auth.repository'
import type { LoginCredentials, LoginResult } from '../../domain/models/credentials.model'
import { AuthRemoteDataSource } from '../datasources/auth.remote.datasource'
import type { User } from '../../domain/models/user.model'
import { APP_CONFIG } from '@core/config/app.config'

export class AuthRepositoryImpl implements AuthRepository {
  private readonly remoteDataSource: AuthRemoteDataSource

  constructor(remoteDataSource?: AuthRemoteDataSource) {
    this.remoteDataSource = remoteDataSource || new AuthRemoteDataSource()
  }

  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const response = await this.remoteDataSource.login(credentials)

    if (!response.token) {
      throw new Error('Token vacío')
    }

    const decodedUser = jwtDecode<User>(response.token)

    return {
      token: response.token,
      user: decodedUser,
      roles: response.appRoles ?? [],
    }
  }

  logout(): void {
    const NS = APP_CONFIG.APP_CODE
    localStorage.removeItem('authToken')
    localStorage.removeItem(`${NS}:authRoles`)
  }
}
