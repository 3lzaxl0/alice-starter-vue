/**
 * Represents the authenticated user (decoded from JWT).
 */
export interface User {
  nroDoc: string
  companyName: string
  nombre: string
  codUser: string
  codTrabajador: string
  email: string
  celular: string
  tipoDoc: string
  originCode: string
  sub: string
  type: string
  flagEstado: string
  flagCambio: string
  wsActive: boolean
  timeout: number
  fechUcc: number
  ultimoAcceso: number
  fecRegistro: number
  iat: number
  exp: number
}

/**
 * Represents a role associated with the user for the current app.
 * Matches the backend loginv4 response.
 */
export interface AppRole {
  roleId: number
  roleName: string
  roleType: string
  domainCode: string
}

export interface AuthState {
  user: User | null
  token: string | null
}
