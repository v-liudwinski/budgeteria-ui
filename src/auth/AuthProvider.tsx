import { createContext, useContext, useEffect, useRef, useCallback, useState, type ReactNode } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import type { AuthUser } from '../api/types'
import { setAccessTokenProvider } from '../api/apiClient'
import { authApi } from '../api/authApi'

type AuthContextValue = {
  user: AuthUser | null
  /** Auth0 has finished initializing AND (if authenticated) the backend user has been synced. */
  isReady: boolean
  isAuthenticated: boolean
  isLoading: boolean
  auth0Error: Error | undefined
  login: (returnTo?: string) => Promise<void>
  register: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  updateProfile: (updates: { name?: string; avatar?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    user: auth0User,
    isAuthenticated,
    isLoading: auth0Loading,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
    error: auth0Error,
  } = useAuth0()

  // Stable ref so the token provider closure never goes stale
  const getTokenRef = useRef(getAccessTokenSilently)
  getTokenRef.current = getAccessTokenSilently

  // Wire up token provider exactly once (reads latest fn via ref)
  const [tokenProviderSet, setTokenProviderSet] = useState(false)
  useEffect(() => {
    setAccessTokenProvider(() => getTokenRef.current())
    setTokenProviderSet(true)
  }, [])

  // Backend-synced user profile (replaces Auth0 claims with real DB data)
  const [syncedUser, setSyncedUser] = useState<AuthUser | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const syncAttempted = useRef(false)

  // Once Auth0 is done loading and user is authenticated, sync with backend
  useEffect(() => {
    if (auth0Loading || !isAuthenticated || !auth0User || !tokenProviderSet) return
    if (syncAttempted.current) return
    syncAttempted.current = true

    async function syncUser() {
      setIsSyncing(true)
      console.log('[AuthProvider] syncing user with backend...')
      try {
        // GET /auth/me — auto-creates backend user on first call
        let backendUser = await authApi.getMe()
        console.log('[AuthProvider] backend user:', JSON.stringify(backendUser))

        // If backend has no name but Auth0 does (e.g. Google login), push it
        const auth0Name = auth0User!.name || auth0User!.given_name || ''
        const auth0Avatar = auth0User!.picture || ''
        const needsUpdate =
          (!backendUser.name && auth0Name) ||
          (!backendUser.avatar && auth0Avatar)

        if (needsUpdate) {
          backendUser = await authApi.updateMe({
            name: backendUser.name || auth0Name || undefined,
            avatar: backendUser.avatar || auth0Avatar || undefined,
          })
        }

        setSyncedUser(backendUser)
      } catch (err) {
        console.error('User sync failed, falling back to Auth0 claims:', err)
        // Fall back to Auth0 claims so the app still works
        setSyncedUser({
          id: auth0User!.sub ?? '',
          name: auth0User!.name ?? auth0User!.email ?? '',
          email: auth0User!.email ?? '',
          avatar: auth0User!.picture,
        })
      } finally {
        setIsSyncing(false)
      }
    }

    syncUser()
  }, [auth0Loading, isAuthenticated, auth0User, tokenProviderSet])

  // Reset on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setSyncedUser(null)
      syncAttempted.current = false
    }
  }, [isAuthenticated])

  // isReady = Auth0 done + (not authenticated OR user synced)
  const isReady = !auth0Loading && (!isAuthenticated || syncedUser !== null)
  const isLoading = auth0Loading || isSyncing

  // Use synced user (from backend) if available, otherwise Auth0 claims.
  // Always prefer Auth0's picture URL for avatar since it's freshest.
  const user: AuthUser | null = syncedUser ? {
    ...syncedUser,
    avatar: auth0User?.picture || syncedUser.avatar,
  } : (auth0User ? {
    id: auth0User.sub ?? '',
    name: auth0User.name ?? auth0User.email ?? '',
    email: auth0User.email ?? '',
    avatar: auth0User.picture,
  } : null)

  const login = useCallback(async (returnTo?: string) => {
    await loginWithRedirect({
      appState: returnTo ? { returnTo } : undefined,
    })
  }, [loginWithRedirect])

  const register = useCallback(async () => {
    await loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })
  }, [loginWithRedirect])

  const loginWithGoogle = useCallback(async () => {
    await loginWithRedirect({ authorizationParams: { connection: 'google-oauth2' } })
  }, [loginWithRedirect])

  const logout = useCallback(() => {
    auth0Logout({ logoutParams: { returnTo: window.location.origin } })
  }, [auth0Logout])

  const updateProfile = useCallback(async (updates: { name?: string; avatar?: string }) => {
    const updated = await authApi.updateMe(updates)
    setSyncedUser(updated)
  }, [])

  // Surface Auth0 errors in dev
  useEffect(() => {
    if (auth0Error) console.error('Auth0 error:', auth0Error)
  }, [auth0Error])

  return (
    <AuthContext.Provider value={{
      user, isReady, isAuthenticated, isLoading, auth0Error,
      login, register, loginWithGoogle, logout, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
