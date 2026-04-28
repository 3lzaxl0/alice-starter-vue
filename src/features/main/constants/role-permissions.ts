/**
 * Role-based permission map.
 * Defines what routes and actions each domainCode has access to.
 */

export interface RoutePermission {
  /** Route path (must match navigation item `to`) */
  path: string
  /** If false, disables all actions (create, status changes, etc.) and row selection. Default: true */
  canActions?: boolean
  /** If true, auto-inject user's cencos in queries (no UI filter shown). Default: false */
  filterByCencos?: boolean
}

export interface RolePermissions {
  /** Human-readable label for this role */
  label: string
  /** Allowed routes and their constraints */
  routes: RoutePermission[]
}

/**
 * Central permission registry keyed by domainCode.
 * To add a new role, just add a new entry here.
 */
export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  OPE_AMI: {
    label: 'Operador de Almacén',
    routes: [
      { path: '/bidones/maestro', canActions: false },
      { path: '/lotes/maestro', canActions: false },
      { path: '/lotes/recepcion' },
      { path: '/solicitud/despacho' },
      { path: '/bidones/stock' },
    ],
  },
  OPE_PA: {
    label: 'Operador de Planta de Agua',
    routes: [
      { path: '/bidones/maestro' },
      { path: '/bidones/llenado' },
      { path: '/bidones/retorno' },
      { path: '/lotes/maestro' },
    ],
  },
  OPE_ELABORACION: {
    label: 'Operador de Elaboración',
    routes: [
      { path: '/bidones/maestro', canActions: false },
      { path: '/lotes/maestro' },
      { path: '/lotes/aprobacion' },
      { path: '/bidones/stock' },
    ],
  },
  OPE_SST: {
    label: 'Operador SST',
    routes: [
      { path: '/bidones/maestro', canActions: false },
      { path: '/lotes/maestro', canActions: false },
      { path: '/solicitud/maestro' },
      { path: '/solicitud/solicitud' },
      { path: '/solicitud/aprobacion' },
      { path: '/bidones/limites' },
      { path: '/bidones/stock' },
    ],
  },
  USER: {
    label: 'Usuario',
    routes: [
      { path: '/bidones/maestro', canActions: false, filterByCencos: true },
      { path: '/solicitud/maestro', filterByCencos: true },
      { path: '/solicitud/solicitud' },
      { path: '/bidones/stock' },
    ],
  },
}
