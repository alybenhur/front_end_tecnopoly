<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold text-primary">Materias</h1>
        <p class="text-medium-emphasis text-body-2 mt-1">Gestión de materias y asignación de profesores</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg" @click="openCreate">
        Nueva Materia
      </v-btn>
    </div>

    <v-card rounded="lg" elevation="1" class="mb-4">
      <v-card-text class="pb-3">
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              placeholder="Buscar materia..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="filterGrade"
              :items="gradeOptions"
              placeholder="Todos los grados"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              clearable
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card rounded="lg" elevation="1">
      <v-data-table
        :headers="headers"
        :items="filteredSubjects"
        :loading="loading"
        loading-text="Cargando materias..."
        no-data-text="No hay materias registradas"
        items-per-page-text="Filas por página"
        rounded="lg"
      >
        <template #item.grade="{ item }">
          <v-chip v-if="item.grade" size="small" color="info" variant="tonal">{{ item.grade.name }}</v-chip>
          <span v-else class="text-medium-emphasis text-body-2">—</span>
        </template>
        <template #item.subject_professors="{ item }">
          <div class="d-flex flex-wrap gap-1 py-1">
            <v-chip
              v-for="sp in item.subject_professors?.slice(0, 2)"
              :key="sp.professor_id"
              size="x-small"
              color="success"
              variant="tonal"
            >
              {{ sp.professor.name }}
            </v-chip>
            <v-chip v-if="(item.subject_professors?.length ?? 0) > 2" size="x-small" variant="tonal">
              +{{ item.subject_professors.length - 2 }}
            </v-chip>
            <span v-if="!item.subject_professors?.length" class="text-medium-emphasis text-body-2">Sin asignar</span>
          </div>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-account-plus" variant="text" size="small" color="success" title="Gestionar profesores" @click="openProfessors(item)" />
          <v-btn icon="mdi-format-list-bulleted" variant="text" size="small" color="info" title="Ver preguntas" @click="goToQuestions(item)" />
          <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="openEdit(item)" />
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="confirmDelete(item)" />
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500" persistent>
      <v-card rounded="lg">
        <v-card-title class="pt-5 px-6">{{ editing ? 'Editar Materia' : 'Nueva Materia' }}</v-card-title>
        <v-card-text class="px-6">
          <v-form ref="formRef">
            <v-text-field
              v-model="form.name"
              label="Nombre de la materia"
              variant="outlined"
              rounded="lg"
              :rules="[rules.required, rules.minLen(2)]"
              class="mb-3"
            />
            <v-textarea
              v-model="form.description"
              label="Descripción (opcional)"
              variant="outlined"
              rounded="lg"
              rows="3"
              class="mb-3"
            />
            <v-select
              v-model="form.grade_id"
              :items="gradeOptions"
              label="Grado (opcional)"
              variant="outlined"
              rounded="lg"
              clearable
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pb-4 pr-6">
          <v-spacer />
          <v-btn variant="text" rounded="lg" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="elevated" rounded="lg" :loading="saving" @click="saveSubject">
            {{ editing ? 'Guardar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Professors Management Dialog -->
    <v-dialog v-model="professorsDialog" max-width="560" persistent>
      <v-card rounded="lg">
        <v-card-title class="pt-5 px-6 d-flex align-center gap-2">
          <v-icon color="success">mdi-account-group</v-icon>
          Profesores — {{ selectedSubject?.name }}
        </v-card-title>
        <v-card-text class="px-6">
          <!-- Assigned professors -->
          <p class="text-subtitle-2 mb-2">Asignados actualmente</p>
          <div v-if="assignedProfessors.length" class="d-flex flex-wrap gap-2 mb-4">
            <v-chip
              v-for="p in assignedProfessors"
              :key="p.id"
              color="success"
              variant="tonal"
              closable
              @click:close="removeProfessor(p.id)"
            >
              {{ p.name }}
            </v-chip>
          </div>
          <p v-else class="text-medium-emphasis text-body-2 mb-4">Ningún profesor asignado</p>

          <v-divider class="mb-4" />

          <!-- Add professor -->
          <p class="text-subtitle-2 mb-2">Agregar profesor</p>
          <v-autocomplete
            v-model="professorToAdd"
            :items="availableProfessors"
            item-title="name"
            item-value="id"
            label="Seleccionar profesor"
            variant="outlined"
            rounded="lg"
            density="compact"
            clearable
            hide-details
          />
        </v-card-text>
        <v-card-actions class="pb-4 pr-6">
          <v-spacer />
          <v-btn variant="text" rounded="lg" @click="professorsDialog = false">Cerrar</v-btn>
          <v-btn
            color="success"
            variant="elevated"
            rounded="lg"
            :disabled="!professorToAdd"
            :loading="assigningProfessor"
            @click="addProfessor"
          >
            Asignar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <AppConfirmDialog
      v-model="confirmDialog"
      title="Eliminar materia"
      :message="`¿Seguro que deseas eliminar '${selectedSubject?.name}'?`"
      :loading="deleting"
      @confirm="deleteSubject"
      @cancel="confirmDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'
import { useSnackbarStore } from '~/stores/snackbar'

definePageMeta({ layout: 'dashboard', middleware: 'admin-only' })

const api = useApi()
const snackbar = useSnackbarStore()
const router = useRouter()

interface Professor { id: string; name: string; email: string }
interface SubjectProfessor { id: string; subject_id: string; professor_id: string; professor: Professor }
interface Grade { id: string; name: string }
interface Subject {
  id: string
  name: string
  description?: string
  grade?: Grade
  grade_id?: string
  subject_professors?: SubjectProfessor[]
}

const subjects = ref<Subject[]>([])
const allProfessors = ref<Professor[]>([])
const allGrades = ref<Grade[]>([])
const loading = ref(false)
const dialog = ref(false)
const professorsDialog = ref(false)
const confirmDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const assigningProfessor = ref(false)
const editing = ref(false)
const selectedSubject = ref<Subject | null>(null)
const assignedProfessors = ref<Professor[]>([])
const professorToAdd = ref<string | null>(null)
const formRef = ref()
const search = ref('')
const filterGrade = ref<string | null>(null)
const form = reactive({ name: '', description: '', grade_id: null as string | null })

const headers = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Grado', key: 'grade', sortable: false },
  { title: 'Profesores', key: 'subject_professors', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' as const },
]

const rules = {
  required: (v: string) => !!v || 'Campo requerido',
  minLen: (n: number) => (v: string) => (v && v.length >= n) || `Mínimo ${n} caracteres`,
}

const gradeOptions = computed(() => allGrades.value.map((g) => ({ title: g.name, value: g.id })))

const filteredSubjects = computed(() =>
  subjects.value.filter((s) => {
    const matchSearch = !search.value || s.name.toLowerCase().includes(search.value.toLowerCase())
    const matchGrade = !filterGrade.value || s.grade?.id === filterGrade.value
    return matchSearch && matchGrade
  })
)

const availableProfessors = computed(() =>
  allProfessors.value.filter((p) => !assignedProfessors.value.some((a) => a.id === p.id))
)

async function loadData() {
  loading.value = true
  try {
    const [s, p, g] = await Promise.all([
      api.get<Subject[]>('/subjects'),
      api.get<any[]>('/users', { role: 'profesor' }),
      api.get<Grade[]>('/grades'),
    ])
    subjects.value = s
    allProfessors.value = p
    allGrades.value = g
  } catch (e: any) {
    snackbar.error(e?.message ?? 'Error al cargar datos')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = false
  Object.assign(form, { name: '', description: '', grade_id: null })
  dialog.value = true
}

function openEdit(subject: Subject) {
  editing.value = true
  selectedSubject.value = subject
  Object.assign(form, { name: subject.name, description: subject.description ?? '', grade_id: subject.grade?.id ?? null })
  dialog.value = true
}

async function saveSubject() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  saving.value = true
  try {
    const payload: any = { name: form.name, description: form.description || undefined }
    if (form.grade_id) payload.grade_id = form.grade_id
    if (editing.value && selectedSubject.value) {
      await api.patch(`/subjects/${selectedSubject.value.id}`, payload)
      snackbar.success('Materia actualizada')
    } else {
      await api.post('/subjects', payload)
      snackbar.success('Materia creada')
    }
    dialog.value = false
    await loadData()
  } catch (e: any) {
    snackbar.error(e?.message ?? 'Error al guardar materia')
  } finally {
    saving.value = false
  }
}

async function loadAssignedProfessors(subjectId: string): Promise<Professor[]> {
  const sps = await api.get<SubjectProfessor[]>(`/subjects/${subjectId}/professors`)
  return sps.map((sp) => sp.professor)
}

async function openProfessors(subject: Subject) {
  selectedSubject.value = subject
  professorToAdd.value = null
  try {
    assignedProfessors.value = await loadAssignedProfessors(subject.id)
  } catch {
    assignedProfessors.value = subject.subject_professors?.map((sp) => sp.professor) ?? []
  }
  professorsDialog.value = true
}

async function addProfessor() {
  if (!professorToAdd.value || !selectedSubject.value) return
  assigningProfessor.value = true
  try {
    await api.post(`/subjects/${selectedSubject.value.id}/professors`, { professor_id: professorToAdd.value })
    snackbar.success('Profesor asignado')
    professorToAdd.value = null
    assignedProfessors.value = await loadAssignedProfessors(selectedSubject.value.id)
    await loadData()
  } catch (e: any) {
    snackbar.error(e?.message ?? 'Error al asignar profesor')
  } finally {
    assigningProfessor.value = false
  }
}

async function removeProfessor(professorId: string) {
  if (!selectedSubject.value) return
  try {
    await api.del(`/subjects/${selectedSubject.value.id}/professors/${professorId}`)
    snackbar.success('Profesor removido')
    assignedProfessors.value = assignedProfessors.value.filter((p) => p.id !== professorId)
    await loadData()
  } catch (e: any) {
    snackbar.error(e?.message ?? 'Error al remover profesor')
  }
}

function goToQuestions(subject: Subject) {
  router.push(`/dashboard/subjects/${subject.id}/questions`)
}

function confirmDelete(subject: Subject) {
  selectedSubject.value = subject
  confirmDialog.value = true
}

async function deleteSubject() {
  if (!selectedSubject.value) return
  deleting.value = true
  try {
    await api.del(`/subjects/${selectedSubject.value.id}`)
    snackbar.success('Materia eliminada')
    confirmDialog.value = false
    await loadData()
  } catch (e: any) {
    snackbar.error(e?.message ?? 'Error al eliminar materia')
  } finally {
    deleting.value = false
  }
}

onMounted(loadData)
</script>
