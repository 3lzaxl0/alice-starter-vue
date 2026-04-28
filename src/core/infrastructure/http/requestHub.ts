import { ref, type Ref } from 'vue'

interface RequestMeta {
  label: string
  timeoutMs: number
  silent: boolean
}

interface ActiveRequest {
  id: string
  key: string
  label: string
  timestamp: number
  abortController: AbortController
}

const activeRequests: Ref<Map<string, ActiveRequest>> = ref(new Map())

export function beginRequest(key: string, meta: RequestMeta) {
  const id = crypto.randomUUID()
  const controller = new AbortController()

  const req: ActiveRequest = {
    id,
    key,
    label: meta.label,
    timestamp: Date.now(),
    abortController: controller,
  }

  activeRequests.value.set(id, req)

  // Auto-timeout
  if (meta.timeoutMs > 0) {
    setTimeout(() => {
      const current = activeRequests.value.get(id)
      if (current) {
        current.abortController.abort('TIMEOUT')
        activeRequests.value.delete(id)
      }
    }, meta.timeoutMs)
  }

  const done = () => {
    activeRequests.value.delete(id)
  }

  return {
    signal: controller.signal,
    id,
    done,
  }
}

export function useRequestHub() {
  return {
    activeRequests,
  }
}
