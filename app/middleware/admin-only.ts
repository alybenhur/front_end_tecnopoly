import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  authStore.loadFromStorage()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
  if (!authStore.isAdmin) {
    return navigateTo('/dashboard')
  }
})
