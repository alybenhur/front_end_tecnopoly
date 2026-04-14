<template>
  <div>
    <h1 class="text-h5 font-weight-bold text-primary mb-1">
      Bienvenido, {{ authStore.user?.name }}
    </h1>
    <p class="text-medium-emphasis text-body-2 mb-6">
      Panel de administración de Tecnopoly
    </p>

    <v-row>
      <v-col v-for="card in statsCards" :key="card.title" cols="12" sm="6" md="3">
        <v-card rounded="lg" elevation="2" :to="card.to" class="stat-card">
          <v-card-text class="d-flex align-center gap-4 pa-5">
            <v-avatar :color="card.color" variant="tonal" size="56">
              <v-icon size="28">{{ card.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ card.value }}</div>
              <div class="text-body-2 text-medium-emphasis">{{ card.title }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick actions -->
    <h2 class="text-subtitle-1 font-weight-bold mt-8 mb-3">Acciones rápidas</h2>
    <v-row>
      <v-col v-for="action in quickActions" :key="action.title" cols="12" sm="6" md="4">
        <v-card rounded="lg" elevation="1" :to="action.to" class="stat-card pa-1">
          <v-list-item
            :prepend-icon="action.icon"
            :title="action.title"
            :subtitle="action.subtitle"
            nav
          >
            <template #append>
              <v-icon color="grey-lighten-1">mdi-chevron-right</v-icon>
            </template>
          </v-list-item>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const authStore = useAuthStore()
const api = useApi()

const counts = reactive({ users: 0, grades: 0, subjects: 0, questions: 0 })

const statsCards = computed(() => {
  if (authStore.isAdmin) {
    return [
      { title: 'Usuarios', value: counts.users, icon: 'mdi-account-group', color: 'primary', to: '/dashboard/users' },
      { title: 'Grados', value: counts.grades, icon: 'mdi-school', color: 'warning', to: '/dashboard/grades' },
      { title: 'Materias', value: counts.subjects, icon: 'mdi-book-open-variant', color: 'success', to: '/dashboard/subjects' },
    ]
  }
  return [
    { title: 'Mis Materias', value: counts.subjects, icon: 'mdi-book-account', color: 'primary', to: '/dashboard/my-subjects' },
  ]
})

const quickActions = computed(() => {
  if (authStore.isAdmin) {
    return [
      { title: 'Crear usuario', subtitle: 'Agregar admin o profesor', icon: 'mdi-account-plus', to: '/dashboard/users' },
      { title: 'Crear grado', subtitle: 'Nuevo grado escolar', icon: 'mdi-school', to: '/dashboard/grades' },
      { title: 'Crear materia', subtitle: 'Nueva materia', icon: 'mdi-book-plus', to: '/dashboard/subjects' },
    ]
  }
  return [
    { title: 'Ver mis materias', subtitle: 'Materias asignadas a ti', icon: 'mdi-book-account', to: '/dashboard/my-subjects' },
  ]
})

onMounted(async () => {
  try {
    if (authStore.isAdmin) {
      const [users, grades, subjects] = await Promise.all([
        api.get<any[]>('/users'),
        api.get<any[]>('/grades'),
        api.get<any[]>('/subjects'),
      ])
      counts.users = users.length
      counts.grades = grades.length
      counts.subjects = subjects.length
    } else {
      const subjects = await api.get<any[]>('/subjects')
      counts.subjects = subjects.length
    }
  } catch { /* silent */ }
})
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.1) !important;
}
</style>
