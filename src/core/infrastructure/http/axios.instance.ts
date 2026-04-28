import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'
import { beginRequest } from './requestHub'

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  meta?: {
    key?: string
    label?: string
    silent?: boolean
    timeoutMs?: number
    __reqId?: string
    __done?: () => void
  }
}

// --- Provider Contracts ---
export interface ApiProvider {
  getToken: () => string | null
  getUserId: () => string | undefined
  onUnauthorized: () => void
}

let provider: ApiProvider | null = null

export function configureApi(newProvider: ApiProvider) {
  provider = newProvider
}
// -----------------------

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// REQUEST
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.url) {
    config.url = config.url.replace(/([^:]\/)\/+/g, '$1')
  }

  // Use provided token/user if configured
  if (provider) {
    const token = provider.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    const userId = provider.getUserId()
    if (userId) {
      config.headers['X-Usuario'] = userId
    }
  }

  // --- RequestHub logic ---
  const customConfig = config as CustomRequestConfig
  const method = (customConfig.method || 'GET').toUpperCase()
  const key = customConfig.meta?.key || `${method} ${customConfig.url}`
  const label = customConfig.meta?.label ?? key
  const silent = !!customConfig.meta?.silent
  const toMs = Number.isFinite(customConfig.meta?.timeoutMs) ? customConfig.meta!.timeoutMs! : 20000

  const { signal, id, done } = beginRequest(key, { label, timeoutMs: toMs, silent })
  customConfig.signal = signal
  customConfig.meta = { ...(customConfig.meta || {}), __reqId: id, __done: done }

  return customConfig
})

// RESPONSE
api.interceptors.response.use(
  (res: AxiosResponse) => {
    const config = res.config as CustomRequestConfig
    config.meta?.__done?.()
    return res
  },
  (err: AxiosError) => {
    const config = err.config as CustomRequestConfig | undefined
    config?.meta?.__done?.()

    // Global Error Handling (e.g. 401 Token Expired)
    if (err.response?.status === 401) {
      if (provider) {
        provider.onUnauthorized()
      } else {
        // Fallback if not configured
        window.location.href = `${import.meta.env.BASE_URL}login`
      }
    }
    return Promise.reject(err)
  },
)

export default api
