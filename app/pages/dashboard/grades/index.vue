<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold text-primary">Grados</h1>
        <p class="text-medium-emphasis text-body-2 mt-1">Gestión de grados escolares</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg" @click="openCreate">
        Nuevo Grado
      </v-btn>
    </div>

    <v-card rounded="lg" elevation="1" class="mb-4">
      <v-card-text class="pb-3">
        <v-text-field
          v-model="search"
          placeholder="Buscar grado..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          rounded="lg"
          hide-details
          clearable
          style="max-width: 400px"
        />
      </v-card-text>
    </v-card>

    <v-card rounded="lg" elevation="1">
      <v-data-table
        :headers="headers"
        :items="filteredGrades"
        :loading="loading"
        loading-text="Cargando grados..."
        no-data-text="No hay grados registrados"
        items-per-page-text="Filas por página"
        rounded="lg"
      >
        <template #item.subjects="{ item }">
          <v-chip size="small" color="primary" variant="tonal">
            {{ item.subjects?.length ?? 0 }} materias
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="openEdit(item)" />
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="confirmDelete(item)" />
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="480" persistent>
      <v-card rounded="lg">
        <v-card-title class="pt-5 px-6">{{ editing ? 'Editar Grado' : 'Nuevo Grado' }}</v-card-title>
        <v-card-text class="px-6">
          <v-form ref="formRef">
            <v-text-field
              v-model="form.name"
              label="Nombre del grado"
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
              auto-grow
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pb-4 pr-6">
          <v-spacer />
          <v-btn variant="text" rounded="lg" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="elevated" rounded="lg" :loading="saving" @click="saveGrade">
            {{ editing ? 'Guardar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <AppConfirmDialog
      v-model="confirmDialog"
      title="Eliminar grado"
      :message="`¿Seguro que deseas eliminar el grado '${selectedGrade?.name}'? Se eliminarán sus materias asociadas.`"
      :loading="deleting"
      @confirm="deleteGrade"
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

interface Grade {
  id: string
  name: string
  description?: string
  subjects?: any[]
}

const grades = ref<Grade[]>([])
const loading = ref(false)
const dialog = ref(false)
const confirmDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const editing = ref(false)
const selectedGrade = ref<Grade | null>(null)
const formRef = ref()
const search = ref('')
const form = reactive({ name: '', description: '' })

const headers = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Descripción', key: 'description', sortable: false },
  { title: 'Materias', key: 'subjects', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' as const },
]

const rules = {
  required: (v: string) => !!v || 'Campo requerido',
  minLen: (n: number) => (v: string) => (v && v.length >= n) || `Mínimo ${n} caracteres`,
}

const filteredGrades = computed(() =>
  grades.value.filter((g) => !search.value || g.name.toLowerCase().includes(search.value.toLowerCase()))
)

async function loadGrades() {
  loading.value = true
  try {
    grades.value = await api.get<Grade[]>('/grades')
  } catch (e: any) {
    snackbar.error(e?.message ?? 'Error al cargar grados')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = false
  Object.assign(form, { name: '', description: '' })
  dialog.value = true
}

function openEdit(grade: Grade) {
  editing.value = true
  selectedGrade.value = grade
  Object.assign(form, { name: grade.name, description: grade.description ?? '' })
  dialog.value = true
}

async function saveGrade() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  saving.value = true
  try {
    if (editing.value && selectedGrade.value) {
      await api.put(`/grades/${selectedGrade.value.id}`, form)
      snackbar.success('Grado actualizado')
    } else {
      await api.post('/grades', form)
      snackbar.success('Grado creado')
    }
    dialog.value = false
    await loadGrades()
  } catch (e: any) {
    snackbar.error(e?.message ?? 'Error al guardar grado')
  } finally {
    saving.value = false
  }
}

function confirmDelete(grade: Grade) {
  selectedGrade.value = grade
  confirmDialog.value = true
}

async function deleteGrade() {
  if (!selectedGrade.value) return
  deleting.value = true
  try {
    await api.del(`/grades/${selectedGrade.value.id}`)
    snackbar.success('Grado eliminado')
    confirmDialog.value = false
    await loadGrades()
  } catch (e: any) {
    snackbar.error(e?.message ?? 'Error al eliminar grado')
  } finally {
    deleting.value = false
  }
}

onMounted(loadGrades)
</script>
