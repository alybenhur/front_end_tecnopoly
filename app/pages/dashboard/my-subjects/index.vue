<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold text-primary">Mis Materias</h1>
      <p class="text-medium-emphasis text-body-2 mt-1">Materias a las que estás asignado</p>
    </div>

    <v-row v-if="loading">
      <v-col v-for="n in 4" :key="n" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader type="card" rounded="lg" />
      </v-col>
    </v-row>

    <v-alert
      v-else-if="!subjects.length"
      type="info"
      variant="tonal"
      rounded="lg"
      icon="mdi-information-outline"
    >
      No tienes materias asignadas. Contacta al administrador para que te asigne una materia.
    </v-alert>

    <v-row v-else>
      <v-col
        v-for="subject in subjects"
        :key="subject.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card rounded="lg" elevation="2" class="h-100 d-flex flex-column subject-card">
          <v-card-item>
            <template #prepend>
              <v-avatar color="primary" variant="tonal" size="44">
                <v-icon>mdi-book-open-variant</v-icon>
              </v-avatar>
            </template>
            <v-card-title class="text-body-1 font-weight-bold">{{ subject.name }}</v-card-title>
            <v-card-subtitle v-if="subject.grade">{{ subject.grade.name }}</v-card-subtitle>
          </v-card-item>

          <v-card-text class="flex-1-1 text-medium-emphasis text-body-2">
            {{ subject.description || 'Sin descripción' }}
          </v-card-text>

          <v-card-actions class="px-4 pb-4">
            <v-spacer />
            <v-btn
              color="primary"
              variant="elevated"
              rounded="lg"
              prepend-icon="mdi-help-circle"
              @click="goToQuestions(subject.id)"
            >
              Ver Preguntas
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'
import { useSnackbarStore } from '~/stores/snackbar'

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

async function loadSubjects() {
  loading.value = true
  try {
    const all = await api.get<Subject[]>('/subjects')
    // Filter subjects where the current professor is assigned using subject_professors from response
    subjects.value = all.filter((s) =>
      s.subject_professors?.some((sp) => sp.professor_id === authStore.user?.id)
    )
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
.subject-card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.subject-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.12) !important;
}
</style>
