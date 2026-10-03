<template>
  <v-dialog :model-value="modelValue" max-width="620" scrollable @update:model-value="emit('update:modelValue', $event)">
    <v-card rounded="lg">
      <v-card-title class="pt-5 px-6 d-flex align-center gap-2">
        <v-icon color="primary">mdi-shape-outline</v-icon>
        Categorías de la materia
      </v-card-title>
      <v-card-subtitle class="px-6 text-wrap">
        Cada pregunta pertenece a una categoría. En el juego se puede jugar con una categoría o con todas.
      </v-card-subtitle>

      <v-card-text class="px-6">
        <!-- Nueva categoría -->
        <v-form ref="newFormRef" class="d-flex align-start gap-2 mb-4" @submit.prevent="createCategory">
          <v-text-field
            v-model="newName"
            label="Nueva categoría"
            placeholder="Ej.: Hardware, Redes, Programación"
            variant="outlined"
            density="compact"
            rounded="lg"
            maxlength="60"
            :rules="[nameRule]"
            class="flex-1-1"
          />
          <v-btn color="primary" rounded="lg" height="40" prepend-icon="mdi-plus" :loading="creating" type="submit">
            Agregar
          </v-btn>
        </v-form>

        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-2" />

        <v-list v-if="categories.length" density="comfortable" rounded="lg" border>
          <v-list-item v-for="c in categories" :key="c.id">
            <template v-if="editingId === c.id">
              <div class="d-flex align-center gap-2 py-1">
                <v-text-field
                  v-model="editName"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  maxlength="60"
                  hide-details
                  autofocus
                  class="flex-1-1"
                  @keyup.enter="saveRename(c)"
                  @keyup.esc="editingId = null"
                />
                <v-btn icon="mdi-check" size="small" variant="text" color="success" :loading="savingId === c.id" @click="saveRename(c)" />
                <v-btn icon="mdi-close" size="small" variant="text" @click="editingId = null" />
              </div>
            </template>
            <template v-else>
              <v-list-item-title class="font-weight-medium">{{ c.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ c.question_count }} {{ c.question_count === 1 ? 'pregunta' : 'preguntas' }}
              </v-list-item-subtitle>
            </template>

            <template v-if="editingId !== c.id" #append>
              <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" title="Renombrar" @click="startRename(c)" />
              <v-tooltip :disabled="c.question_count === 0" location="top">
                <template #activator="{ props: tip }">
                  <span v-bind="tip">
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      :disabled="c.question_count > 0"
                      :loading="deletingId === c.id"
                      @click="deleteCategory(c)"
                    />
                  </span>
                </template>
                Tiene preguntas: muévelas a otra categoría antes de eliminarla
              </v-tooltip>
            </template>
          </v-list-item>
        </v-list>
        <p v-else-if="!loading" class="text-medium-emphasis text-center py-4">
          Esta materia aún no tiene categorías. Crea la primera arriba.
        </p>
      </v-card-text>

      <v-card-actions class="pb-4 pr-6">
        <v-spacer />
        <v-btn variant="text" rounded="lg" @click="emit('update:modelValue', false)">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'
import { useSnackbarStore } from '~/stores/snackbar'

export interface Category { id: string; name: string; description?: string | null; question_count: number }

const props = defineProps<{ modelValue: boolean; subjectId: string }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  /** Las categorías cambiaron (para que la página recargue su lista). */
  changed: [categories: Category[]]
}>()

const api = useApi()
const snackbar = useSnackbarStore()

const categories = ref<Category[]>([])
const loading = ref(false)
const newName = ref('')
const newFormRef = ref()
const creating = ref(false)
const editingId = ref<string | null>(null)
const editName = ref('')
const savingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)

const nameRule = (v: string) => !v || v.trim().length >= 2 || 'Mínimo 2 caracteres'

async function load() {
  loading.value = true
  try {
    categories.value = await api.get<Category[]>(`/subjects/${props.subjectId}/categories`)
    emit('changed', categories.value)
  } catch (e: any) {
    snackbar.error(e?.message ?? 'Error al cargar categorías')
  } finally {
    loading.value = false
  }
}

async function createCategory() {
  const name = newName.value.trim()
  if (name.length < 2) return
  creating.value = true
  try {
    await api.post(`/subjects/${props.subjectId}/categories`, { name })
    snackbar.success(`Categoría "${name}" creada`)
    newName.value = ''
    newFormRef.value?.resetValidation()
    await load()
  } catch (e: any) {
    snackbar.error(e?.message ?? 'Error al crear la categoría')
  } finally {
    creating.value = false
  }
}

function startRename(c: Category) {
  editingId.value = c.id
  editName.value = c.name
}

async function saveRename(c: Category) {
  const name = editName.value.trim()
  if (name.length < 2) { snackbar.error('Mínimo 2 caracteres'); return }
  if (name === c.name) { editingId.value = null; return }
  savingId.value = c.id
  try {
    await api.patch(`/subjects/${props.subjectId}/categories/${c.id}`, { name })
    snackbar.success('Categoría renombrada')
    editingId.value = null
    await load()
  } catch (e: any) {
    snackbar.error(e?.message ?? 'Error al renombrar')
  } finally {
    savingId.value = null
  }
}

async function deleteCategory(c: Category) {
  deletingId.value = c.id
  try {
    await api.del(`/subjects/${props.subjectId}/categories/${c.id}`)
    snackbar.success(`Categoría "${c.name}" eliminada`)
    await load()
  } catch (e: any) {
    snackbar.error(e?.message ?? 'Error al eliminar')
  } finally {
    deletingId.value = null
  }
}

watch(() => props.modelValue, (open) => { if (open) { editingId.value = null; load() } })
</script>
