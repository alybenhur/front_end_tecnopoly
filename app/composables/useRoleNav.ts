import { useAuthStore } from '~/stores/auth'

export interface NavItem {
  title: string
  icon: string
  to: string
  roles: ('admin' | 'profesor')[]
}

const NAV_ITEMS: NavItem[] = [
  { title: 'Inicio', icon: 'mdi-home', to: '/dashboard', roles: ['admin', 'profesor'] },
  { title: 'Usuarios', icon: 'mdi-account-group', to: '/dashboard/users', roles: ['admin'] },
  { title: 'Grados', icon: 'mdi-school', to: '/dashboard/grades', roles: ['admin'] },
  { title: 'Materias', icon: 'mdi-book-open-variant', to: '/dashboard/subjects', roles: ['admin'] },
  { title: 'Mis Materias', icon: 'mdi-book-account', to: '/dashboard/my-subjects', roles: ['profesor'] },
]

export function useRoleNav() {
  const authStore = useAuthStore()

  const navItems = computed(() => {
    const role = authStore.userRole
    if (!role) return []
    return NAV_ITEMS.filter((item) => item.roles.includes(role))
  })

  return { navItems }
}
