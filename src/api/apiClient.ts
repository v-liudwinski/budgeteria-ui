const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.budgeteria.online/api'

let getAccessTokenFn: (() => Promise<string>) | null = null

// Promise gate: API calls wait until the token provider is wired up.
// This prevents race conditions on page refresh where React Query fires
// before the AuthProvider useEffect sets the token provider.
let _resolveTokenReady: () => void
const tokenReady = new Promise<void>((resolve) => {
  _resolveTokenReady = resolve
})

export function setAccessTokenProvider(fn: () => Promise<string>) {
  getAccessTokenFn = fn
  _resolveTokenReady()
}

async function getHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  // Wait until AuthProvider has wired up the token getter
  await tokenReady
  if (getAccessTokenFn) {
    try {
      const token = await getAccessTokenFn()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
        console.log('[apiClient] token attached, length:', token.length)
      } else {
        console.warn('[apiClient] getAccessTokenFn returned empty token')
      }
    } catch (err) {
      // Token fetch failed (expired session, network issue).
      // Let the API call proceed without a token — the 401 will be
      // caught by handleResponse and surfaced to React Query as an error.
      console.warn('Failed to get access token:', err)
    }
  }
  return headers
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text()
    try {
      const json = JSON.parse(text)
      throw new Error(json.error || json.message || text)
    } catch (e) {
      if (e instanceof Error && e.message !== text) throw e
      throw new Error(text || `HTTP ${response.status}`)
    }
  }
  const text = await response.text()
  if (!text || text === 'null') return null as T
  return JSON.parse(text) as T
}

export const api = {
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: await getHeaders(),
    })
    return handleResponse<T>(response)
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: await getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(response)
  },

  async put<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(body),
    })
    return handleResponse<T>(response)
  },

  async del(path: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    })
    if (!response.ok) {
      const text = await response.text()
      try {
        const json = JSON.parse(text)
        throw new Error(json.error || json.message || text)
      } catch (e) {
        if (e instanceof Error && e.message !== text) throw e
        throw new Error(text || `HTTP ${response.status}`)
      }
    }
  },
}
