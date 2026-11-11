<template>
  <div>
    <div class="d-flex flex-wrap align-end justify-space-between ga-4 mb-6">
      <div>
        <h1 class="page-title">Mis materias</h1>
        <p class="page-subtitle">Materias a las que estás asignado. Entra a cada una para gestionar su banco de preguntas.</p>
      </div>
      <v-text-field
        v-if="subjects.length > 3"
        v-model="search"
        placeholder="Buscar materia..."
        prepend-inner-icon="mdi-magnify"
        variant="solo"
        flat
        density="comfortable"
        rounded="lg"
        hide-details
        clearable
        class="search-box"
      />
    </div>

    <v-row v-if="loading">
      <v-col v-for="n in 3" :key="n" cols="12" sm="6" lg="4">
        <v-skeleton-loader type="image, list-item-two-line, actions" class="rounded-xl" />
      </v-col>
    </v-row>

    <v-card v-else-if="!subjects.length" class="empty pa-10 text-center">
      <img src="/img/casilla-pregunta.webp" alt="" class="empty-img">
      <div class="text-h6 font-weight-bold mt-4">Aún no tienes materias</div>
      <p class="text-medium-emphasis mt-1">Pide al administrador que te asigne una materia para empezar a crear preguntas.</p>
    </v-card>

    <v-row v-else>
      <v-col v-for="subject in filtered" :key="subject.id" cols="12" sm="6" lg="4">
        <v-card class="subject-card h-100 d-flex flex-column" @click="goToQuestions(subject.id)">
          <div class="cover" :style="{ '--tile': casillaFor(subject.id).color }">
            <img :src="casillaFor(subject.id).src" alt="" class="cover-tile">
            <v-chip v-if="subject.grade" size="small" class="cover-chip" prepend-icon="mdi-school">
              Grado {{ subject.grade.name }}
            </v-chip>
          </div>

          <div class="pa-5 pb-3 flex-1-1">
            <div class="subject-name">{{ subject.name }}</div>
            <p class="subject-desc">{{ subject.description || 'Sin descripción' }}</p>
          </div>

          <div class="subject-foot">
            <span class="q-count">
              <v-icon size="18" class="mr-1">mdi-help-box-multiple-outline</v-icon>
              <template v-if="questionCounts[subject.id] !== undefined">
                {{ questionCounts[subject.id] }} {{ questionCounts[subject.id] === 1 ? 'pregunta' : 'preguntas' }}
              </template>
              <template v-else>…</template>
            </span>
            <v-btn color="primary" variant="flat" rounded="lg" append-icon="mdi-arrow-right" @click.stop="goToQuestions(subject.id)">
              Ver preguntas
            </v-btn>
          </div>
        </v-card>
      </v-col>
      <v-col v-if="!filtered.length" cols="12">
        <p class="text-medium-emphasis">Ninguna materia coincide con “{{ search }}”.</p>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'
import { useSnackbarStore } from '~/stores/snackbar'
import { casillaFor } from '~/composables/useGameArt'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const api = useApi()
const authStore = useAuthStore()
const snackbar = useSnackbarStore()
const router = useRouter()

interface SubjectProfessor { professor_id: string }
interface Subject {
  id: string
  name: string
  description?: string
  grade?: { id: string; name: string }
  subject_professors?: SubjectProfessor[]
}

const subjects = ref<Subject[]>([])
const loading = ref(false)
const search = ref('')
const questionCounts = reactive<Record<string, number>>({})

const filtered = computed(() => {
  const q = (search.value ?? '').trim().toLowerCase()
  if (!q) return subjects.value
  return subjects.value.filter((s) => s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q))
})

async function loadCounts() {
  await Promise.allSettled(subjects.value.map(async (s) => {
    const list = await api.get<unknown[]>(`/subjects/${s.id}/questions`)
    questionCounts[s.id] = list.length
  }))
}

async function loadSubjects() {
  loading.value = true
  try {
    const all = await api.get<Subject[]>('/subjects')
    // Filter subjects where the current professor is assigned using subject_professors from response
    subjects.value = all.filter((s) =>
      s.subject_professors?.some((sp) => sp.professor_id === authStore.user?.id)
    )
    loadCounts()
  } catch (e: any) {
    snackbar.error(e?.message ?? 'Error al cargar materias')
  } finally {
    loading.value = false
  }
}

function goToQuestions(subjectId: string) {
  router.push(`/dashboard/subjects/${subjectId}/questions`)
}

onMounted(loadSubjects)
</script>

<style scoped>
.search-box {
  max-width: 280px;
  min-width: 220px;
  border: 1px solid var(--tp-line);
  border-radius: 12px;
}

.subject-card {
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}
.subject-card:hover {
  transform: translateY(-3px);
  border-color: #c9d6ea !important;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.1) !important;
}

.cover {
  position: relative;
  height: 150px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 50% 120%, rgba(255, 255, 255, 0.35), transparent 60%),
    linear-gradient(160deg, color-mix(in srgb, var(--tile) 75%, white), var(--tile));
}
.cover-tile {
  width: 104px;
  height: 104px;
  border-radius: 14px;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.25);
  transform: rotate(-4deg);
  transition: transform 0.25s ease;
}
.subject-card:hover .cover-tile {
  transform: rotate(0deg) scale(1.05);
}
.cover-chip {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(255, 255, 255, 0.92) !important;
  color: var(--tp-ink) !important;
  font-weight: 700;
}

.subject-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--tp-ink);
}
.subject-desc {
  margin-top: 4px;
  font-size: 0.9rem;
  color: var(--tp-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.subject-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px 18px;
  border-top: 1px solid var(--tp-line);
}
.q-count {
  display: inline-flex;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--tp-muted);
}

.empty-img {
  width: 96px;
  height: 96px;
  border-radius: 16px;
}
</style>
