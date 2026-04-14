import { useAuthStore } from '~/stores/auth'

export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  async function request<T>(
    endpoint: string,
    options: RequestInit & { params?: Record<string, string | number | boolean | undefined> } = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options

    let url = `${config.public.apiBase}${endpoint}`
    if (params) {
      const query = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
      if (query) url += `?${query}`
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    }
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }

    const response = await fetch(url, { ...fetchOptions, headers })

    if (response.status === 401) {
      authStore.logout()
      await navigateTo('/login')
      throw new Error('No autorizado')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message = errorData?.message ?? `Error ${response.status}`
      throw new Error(Array.isArray(message) ? message.join(', ') : message)
    }

    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
  }

  return {
    get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
      request<T>(endpoint, { method: 'GET', params }),
    post: <T>(endpoint: string, body: unknown) =>
      request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    patch: <T>(endpoint: string, body: unknown) =>
      request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    put: <T>(endpoint: string, body: unknown) =>
      request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    del: <T>(endpoint: string) =>
      request<T>(endpoint, { method: 'DELETE' }),
  }
}
