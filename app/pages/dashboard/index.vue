<template>
  <div>
    <!-- Banner con el tablero del juego -->
    <section class="hero">
      <img src="/img/tablero.webp" alt="" class="hero-img">
      <div class="hero-shade" />
      <div class="hero-body">
        <span class="hero-chip">
          <v-icon size="15" class="mr-1">mdi-calendar-blank-outline</v-icon>
          {{ today }}
        </span>
        <h1 class="hero-title">Hola, {{ firstName }}</h1>
        <p class="hero-text">
          {{ authStore.isAdmin
            ? 'Administra usuarios, grados y materias del juego Tecnopoly.'
            : 'Crea y organiza las preguntas que tus estudiantes responderán en el tablero.' }}
        </p>
        <div class="d-flex flex-wrap ga-3 mt-5">
          <v-btn color="white" class="text-primary" size="large" rounded="lg" :to="primaryAction.to" :prepend-icon="primaryAction.icon">
            {{ primaryAction.title }}
          </v-btn>
        </div>
      </div>
    </section>

    <!-- Métricas -->
    <v-row class="mt-6">
      <v-col v-for="card in statsCards" :key="card.title" cols="12" sm="6" :lg="12 / statsCards.length">
        <v-card :to="card.to" class="stat-card pa-5 h-100">
          <div class="d-flex align-center justify-space-between">
            <div class="stat-icon" :style="{ background: card.bg, color: card.fg }">
              <v-icon size="24">{{ card.icon }}</v-icon>
            </div>
            <v-icon size="18" color="grey-lighten-1">mdi-arrow-top-right</v-icon>
          </div>
          <div class="stat-value">
            <v-progress-circular v-if="loading" indeterminate size="22" width="2" color="primary" />
            <template v-else>{{ card.value }}</template>
          </div>
          <div class="stat-label">{{ card.title }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Accesos rápidos -->
    <div class="section-head">
      <h2 class="section-title">Accesos rápidos</h2>
    </div>
    <v-row>
      <v-col v-for="action in quickActions" :key="action.title" cols="12" sm="6" lg="4">
        <v-card :to="action.to" class="action-card h-100">
          <img :src="action.img" alt="" class="action-img">
          <div class="action-body">
            <div class="action-title">{{ action.title }}</div>
            <div class="action-text">{{ action.subtitle }}</div>
          </div>
          <v-icon class="action-arrow" color="grey">mdi-chevron-right</v-icon>
        </v-card>
      </v-col>
    </v-row>

    <!-- Materias del profesor -->
    <template v-if="!authStore.isAdmin && mySubjects.length">
      <div class="section-head">
        <h2 class="section-title">Tus materias</h2>
        <v-btn variant="text" color="primary" append-icon="mdi-arrow-right" to="/dashboard/my-subjects">Ver todas</v-btn>
      </div>
      <v-row>
        <v-col v-for="s in mySubjects.slice(0, 3)" :key="s.id" cols="12" sm="6" lg="4">
          <v-card :to="`/dashboard/subjects/${s.id}/questions`" class="mini-subject h-100">
            <div class="mini-art" :style="{ background: casillaFor(s.id).color }">
              <img :src="casillaFor(s.id).src" alt="">
            </div>
            <div class="min-w-0">
              <div class="action-title text-truncate">{{ s.name }}</div>
              <div class="action-text">{{ s.grade?.name ? `Grado ${s.grade.name}` : 'Sin grado' }}</div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'
import { casillaFor } from '~/composables/useGameArt'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const authStore = useAuthStore()
const api = useApi()

const loading = ref(true)
const counts = reactive({ users: 0, professors: 0, grades: 0, subjects: 0, questions: 0 })
const mySubjects = ref<any[]>([])

const firstName = computed(() => authStore.user?.name?.split(' ')[0] ?? '')
const today = computed(() => {
  const s = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
  return s.charAt(0).toUpperCase() + s.slice(1)
})

const primaryAction = computed(() => authStore.isAdmin
  ? { title: 'Gestionar materias', icon: 'mdi-book-open-variant', to: '/dashboard/subjects' }
  : { title: 'Ir a mis materias', icon: 'mdi-book-account', to: '/dashboard/my-subjects' })

const statsCards = computed(() => {
  if (authStore.isAdmin) {
    return [
      { title: 'Usuarios', value: counts.users, icon: 'mdi-account-group', bg: '#e3effd', fg: '#1565c0', to: '/dashboard/users' },
      { title: 'Profesores', value: counts.professors, icon: 'mdi-human-male-board', bg: '#e6f6ec', fg: '#2e7d32', to: '/dashboard/users' },
      { title: 'Grados', value: counts.grades, icon: 'mdi-school', bg: '#fff1e0', fg: '#e65100', to: '/dashboard/grades' },
      { title: 'Materias', value: counts.subjects, icon: 'mdi-book-open-variant', bg: '#f1e8fd', fg: '#6a1b9a', to: '/dashboard/subjects' },
    ]
  }
  return [
    { title: 'Mis materias', value: counts.subjects, icon: 'mdi-book-account', bg: '#e3effd', fg: '#1565c0', to: '/dashboard/my-subjects' },
    { title: 'Preguntas creadas', value: counts.questions, icon: 'mdi-help-box-multiple', bg: '#f1e8fd', fg: '#6a1b9a', to: '/dashboard/my-subjects' },
  ]
})

const quickActions = computed(() => {
  if (authStore.isAdmin) {
    return [
      { title: 'Crear usuario', subtitle: 'Agrega un administrador o profesor', img: '/img/casilla-ordenador.webp', to: '/dashboard/users' },
      { title: 'Crear grado', subtitle: 'Organiza las materias por grado', img: '/img/casilla-kindle.webp', to: '/dashboard/grades' },
      { title: 'Crear materia', subtitle: 'Asigna profesores y preguntas', img: '/img/casilla-impresora-3d.webp', to: '/dashboard/subjects' },
    ]
  }
  return [
    { title: 'Mis materias', subtitle: 'Materias asignadas a ti', img: '/img/casilla-kindle.webp', to: '/dashboard/my-subjects' },
    { title: 'Banco de preguntas', subtitle: 'Crea preguntas para el tablero', img: '/img/casilla-pregunta.webp', to: '/dashboard/my-subjects' },
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
      counts.professors = users.filter((u) => u.role === 'profesor').length
      counts.grades = grades.length
      counts.subjects = subjects.length
    } else {
      const all = await api.get<any[]>('/subjects')
      mySubjects.value = all.filter((s) =>
        s.subject_professors?.some((sp: any) => sp.professor_id === authStore.user?.id))
      counts.subjects = mySubjects.value.length
      const lists = await Promise.allSettled(
        mySubjects.value.map((s) => api.get<any[]>(`/subjects/${s.id}/questions`)))
      counts.questions = lists.reduce((n, r) => n + (r.status === 'fulfilled' ? r.value.length : 0), 0)
    }
  } catch { /* silent */ } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  min-height: 260px;
  background: #0b2a5b;
  color: #fff;
}
.hero-img {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 62%;
  object-fit: cover;
  object-position: center 45%;
}
.hero-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #0b2a5b 0%, #0b2a5b 38%, rgba(11, 42, 91, 0.75) 52%, rgba(11, 42, 91, 0.05) 85%);
}
.hero-body {
  position: relative;
  max-width: 520px;
  padding: 36px 40px;
}
.hero-chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
}
.hero-title {
  margin-top: 14px;
  font-size: clamp(1.7rem, 3vw, 2.3rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.01em;
}
.hero-text {
  margin-top: 8px;
  font-size: 1rem;
  opacity: 0.85;
  line-height: 1.5;
}

.stat-card,
.action-card,
.mini-subject {
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}
.stat-card:hover,
.action-card:hover,
.mini-subject:hover {
  transform: translateY(-2px);
  border-color: #c9d6ea !important;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08) !important;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
}
.stat-value {
  margin-top: 18px;
  min-height: 40px;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.2;
  color: var(--tp-ink);
}
.stat-label {
  font-size: 0.88rem;
  color: var(--tp-muted);
  font-weight: 600;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 36px 0 12px;
}
.section-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--tp-ink);
}

.action-card,
.mini-subject {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
}
.action-img {
  flex: none;
  width: 72px;
  height: 72px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
}
.action-body {
  flex: 1;
  min-width: 0;
}
.action-title {
  font-weight: 700;
  color: var(--tp-ink);
}
.action-text {
  font-size: 0.85rem;
  color: var(--tp-muted);
}
.action-arrow {
  flex: none;
}
.mini-art {
  flex: none;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
}
.mini-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 700px) {
  .hero-img {
    width: 100%;
    opacity: 0.35;
  }
  .hero-shade {
    background: linear-gradient(180deg, rgba(11, 42, 91, 0.6), #0b2a5b);
  }
  .hero-body {
    padding: 28px 22px;
  }
}
</style>
