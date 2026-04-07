import { api } from './apiClient'
import type { AuthUser } from './types'

// Backend UserDto: { id (Auth0 sub), name, email, avatar? }
// Maps 1:1 to our AuthUser type.

export const authApi = {
  async getMe(): Promise<AuthUser> {
    return api.get<AuthUser>('/auth/me')
  },

  async updateMe(updates: { name?: string; avatar?: string }): Promise<AuthUser> {
    return api.put<AuthUser>('/auth/me', updates)
  },
}
