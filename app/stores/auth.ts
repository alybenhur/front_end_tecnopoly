import { defineStore } from 'pinia'

export type Role = 'admin' | 'profesor'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
}

export interface AuthState {
  token: string | null
  user: AuthUser | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isProfesor: (state) => state.user?.role === 'profesor',
    userRole: (state) => state.user?.role ?? null,
  },

  actions: {
    setAuth(token: string, user: AuthUser) {
      this.token = token
      this.user = user
      if (import.meta.client) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(user))
      }
    },

    loadFromStorage() {
      if (import.meta.client) {
        const token = localStorage.getItem('auth_token')
        const userRaw = localStorage.getItem('auth_user')
        if (token && userRaw) {
          this.token = token
          this.user = JSON.parse(userRaw) as AuthUser
        }
      }
    },

    logout() {
      this.token = null
      this.user = null
      if (import.meta.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    },
  },
})
