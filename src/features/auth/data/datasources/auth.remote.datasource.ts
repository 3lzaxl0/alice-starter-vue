import api from '@core/infrastructure/http/axios.instance'
import type { LoginCredentials } from '../../domain/models/credentials.model'
import type { AppRole } from '../../domain/models/user.model'

interface AuthResponse {
  token: string
  refreshToken?: string
  appId?: number
  appName?: string
  appTitle?: string
  trackingId?: number
  appRoles?: AppRole[]
}

export class AuthRemoteDataSource {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/loginv4', {
      username: credentials.username,
      password: credentials.password,
      appCode: credentials.appCode,
      platform: credentials.platform,
    })
    return data
  }
}
