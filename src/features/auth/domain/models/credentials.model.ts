import type { User, AppRole } from './user.model'

export interface LoginCredentials {
  username: string
  password: string
  remember?: boolean
  appCode: string
  platform: string
}

export interface LoginResult {
  token: string
  user: User
  roles: AppRole[]
}
