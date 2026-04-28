import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import type { LoginCredentials } from '../domain/models/credentials.model'
import type { User, AppRole } from '../domain/models/user.model'
import type { BsTrabajador } from '../domain/models/worker.model'
import { LoginUseCase } from '../domain/usecases/login.usecase'
import { LogoutUseCase } from '../domain/usecases/logout.usecase'
import { AuthRepositoryImpl } from '../data/repositories/auth.repository.impl'
import { AuthWorkerService } from '../services/auth-worker.service'
import { AuthRoleService } from '../services/auth-role.service'
import { APP_CONFIG } from '@core/config/app.config'
import { ROLE_PERMISSIONS } from '@features/main/constants/role-permissions'
import type { RoutePermission } from '@features/main/constants/role-permissions'

export const useAuthStore = defineStore('auth', () => {
  // --- DEPENDENCIES ---
  const authRepository = new AuthRepositoryImpl()
  const loginUseCase = new LoginUseCase(authRepository)
  const logoutUseCase = new LogoutUseCase(authRepository)
  const workerService = new AuthWorkerService()
  const authRoleService = new AuthRoleService()

  // --- LOCAL STORAGE KEYS (namespaced per app to avoid cross-app collisions) ---
  const NS = APP_CONFIG.APP_CODE
  const KEYS = {
    token: 'authToken',
    roles: `${NS}:authRoles`,
    activeRole: `${NS}:authActiveRole`,
    worker: `${NS}:authWorker`,
  } as const

  // --- LOCAL STORAGE HELPERS ---
  const getStoredWorker = (): BsTrabajador | null => {
    const stored = localStorage.getItem(KEYS.worker)
    return stored ? JSON.parse(stored) : null
  }

  const getStoredRoles = (): AppRole[] => {
    const stored = localStorage.getItem(KEYS.roles)
    return stored ? JSON.parse(stored) : []
  }

  const getStoredActiveRole = (): string | null => {
    return localStorage.getItem(KEYS.activeRole)
  }

  // --- STATE (ref) ---
  const token = ref<string | null>(localStorage.getItem(KEYS.token) || null)
  const user = ref<User | null>(token.value ? jwtDecode<User>(token.value) : null)
  const worker = ref<BsTrabajador | null>(getStoredWorker())
  const roles = ref<AppRole[]>(getStoredRoles())
  const activeRoleDomainCode = ref<string | null>(getStoredActiveRole())
  const isInitialSyncing = ref(false)

  // --- GETTERS (computed) ---
  const isAuthenticated = computed(() => !!token.value)
  const tokenExpiresAt = computed(() => (user.value ? new Date(user.value.exp * 1000) : null))
  const roleIds = computed(() => roles.value.map((r) => r.roleId))

  /** The currently active AppRole object */
  const activeRole = computed(() => {
    if (!activeRoleDomainCode.value) return null
    return roles.value.find((r) => r.domainCode === activeRoleDomainCode.value) ?? null
  })

  /** Permissions for the currently active role */
  const activePermissions = computed<RoutePermission[]>(() => {
    if (!activeRoleDomainCode.value) return []
    const perms = ROLE_PERMISSIONS[activeRoleDomainCode.value]
    return perms?.routes ?? []
  })

  /** Allowed route paths for the active role */
  const allowedPaths = computed(() => activePermissions.value.map((r) => r.path))

  // --- ROLE UTILITIES ---

  /**
   * Returns true if the user has the given roleId.
   */
  function hasRole(roleId: number): boolean {
    return roleIds.value.includes(roleId)
  }

  /**
   * Returns true if the user has at least one of the given roleIds.
   */
  function hasAnyRole(ids: number[]): boolean {
    return ids.some((id) => roleIds.value.includes(id))
  }

  /**
   * Sets the active role by domainCode and persists it.
   */
  function setActiveRole(domainCode: string) {
    const role = roles.value.find((r) => r.domainCode === domainCode)
    if (role) {
      activeRoleDomainCode.value = domainCode
      localStorage.setItem(KEYS.activeRole, domainCode)
    }
  }

  /**
   * Returns true if the active role can access the given route path.
   */
  function canAccessRoute(path: string): boolean {
    // Welcome/Home is always accessible
    if (path === '/' || path === '') return true
    return allowedPaths.value.some((allowed) => path.startsWith(allowed))
  }

  /**
   * Returns true if the active role can perform actions (create, status changes, etc.) for the given path.
   * Defaults to true if `canActions` is not explicitly set to false.
   */
  function canActIn(path: string): boolean {
    const perm = activePermissions.value.find((r) => path.startsWith(r.path))
    if (!perm) return false
    return perm.canActions !== false
  }

  /**
   * Returns true if the active role should auto-filter by cencos for the given path.
   */
  function shouldFilterByCencos(path: string): boolean {
    const perm = activePermissions.value.find((r) => path.startsWith(r.path))
    if (!perm) return false
    return perm.filterByCencos === true
  }

  // --- ACTIONS (function) ---
  async function login(credentials: Omit<LoginCredentials, 'appCode' | 'platform'>) {
    try {
      const fullCredentials: LoginCredentials = {
        ...credentials,
        appCode: APP_CONFIG.APP_CODE,
        platform: APP_CONFIG.PLATFORM,
      }

      const result = await loginUseCase.execute(fullCredentials)

      // Update basic auth state
      token.value = result.token
      user.value = result.user
      roles.value = result.roles

      // Persist auth data
      localStorage.setItem(KEYS.token, result.token)
      localStorage.setItem(KEYS.roles, JSON.stringify(result.roles))

      // Pre-select the first role
      if (result.roles.length > 0 && result.roles[0]) {
        setActiveRole(result.roles[0].domainCode)
      }

      // Fetch worker data based on DNI
      if (user.value?.nroDoc) {
        await refreshWorkerData(user.value.nroDoc)
      }

      return true
    } catch (error) {
      throw error
    }
  }

  async function refreshWorkerData(dni: string) {
    try {
      const fetchWorker = await workerService.getWorkerByDni(dni)
      if (fetchWorker) {
        worker.value = fetchWorker
        localStorage.setItem(KEYS.worker, JSON.stringify(fetchWorker))
        return true
      }
    } catch (error) {
      console.error('AuthStore: Failed to fetch worker details:', error)
    }
    return false
  }

  async function refreshUserRoles() {
    if (!user.value?.sub) return false
    try {
      const fetchedRoles = await authRoleService.getAppRolesByUser(
        user.value.sub,
        APP_CONFIG.APP_CODE,
      )
      if (fetchedRoles && fetchedRoles.length > 0) {
        roles.value = fetchedRoles
        localStorage.setItem(KEYS.roles, JSON.stringify(fetchedRoles))

        // Pre-select the first role if none is active
        if (!activeRoleDomainCode.value || !activeRole.value) {
          const firstRoleContext = fetchedRoles[0]?.domainCode
          if (firstRoleContext) {
            setActiveRole(firstRoleContext)
          }
        }
        return true
      }
    } catch (error) {
      console.error('AuthStore: Failed to fetch roles:', error)
    }
    return false
  }

  async function fetchRolesIfMissing() {
    if (token.value && roles.value.length === 0) {
      await refreshUserRoles()
    }
  }

  /**
   * Validates if the current worker data matches the JWT token.
   * If not, it clears local state and re-fetches everything to stay in sync.
   */
  async function validateAndSyncSession() {
    if (!token.value || !user.value) return

    const tokenDni = user.value.nroDoc
    const storedDni = worker.value?.nroDoc

    const isMismatch = storedDni && tokenDni !== storedDni
    const missingWorker = !worker.value
    const missingRoles = roles.value.length === 0

    if (isMismatch || missingWorker || missingRoles) {
      console.warn('AuthStore: Session discrepancy detected. Synchronizing...')
      isInitialSyncing.value = true

      try {
        if (isMismatch) {
          // Clear obsolete local data but keep the token
          worker.value = null
          roles.value = []
          activeRoleDomainCode.value = null
          localStorage.removeItem(KEYS.worker)
          localStorage.removeItem(KEYS.roles)
          localStorage.removeItem(KEYS.activeRole)
        }

        // Re-fetch all necessary data
        await Promise.all([refreshWorkerData(tokenDni), refreshUserRoles()])
      } finally {
        isInitialSyncing.value = false
      }
    }
  }

  function logout() {
    logoutUseCase.execute()
    token.value = null
    user.value = null
    worker.value = null
    roles.value = []
    activeRoleDomainCode.value = null
    localStorage.removeItem(KEYS.worker)
    localStorage.removeItem(KEYS.roles)
    localStorage.removeItem(KEYS.activeRole)
  }

  // Call validateAndSyncSession on store load to ensure data consistency
  validateAndSyncSession()

  return {
    token,
    user,
    worker,
    roles,
    roleIds,
    activeRole,
    activeRoleDomainCode,
    activePermissions,
    allowedPaths,
    isAuthenticated,
    tokenExpiresAt,
    login,
    fetchRolesIfMissing,
    logout,
    hasRole,
    hasAnyRole,
    setActiveRole,
    canAccessRoute,
    canActIn,
    shouldFilterByCencos,
    refreshWorkerData,
    refreshUserRoles,
    validateAndSyncSession,
    isInitialSyncing,
  }
})
