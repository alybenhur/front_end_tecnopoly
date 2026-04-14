<template>
  <div>
    <!-- Back button + Header -->
    <div class="d-flex align-center gap-3 mb-2">
      <v-btn icon="mdi-arrow-left" variant="text" color="primary" @click="router.back()" />
      <div>
        <h1 class="text-h5 font-weight-bold text-primary">
          Preguntas — {{ subjectName }}
        </h1>
        <p class="text-medium-emphasis text-body-2 mt-1">Banco de preguntas de la materia</p>
      </div>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg" @click="openCreate">
        Nueva Pregunta
      </v-btn>
    </div>

    <!-- Filters -->
    <v-card rounded="lg" elevation="1" class="mb-4">
      <v-card-text class="pb-3">
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              placeholder="Buscar pregunta..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filterLevel"
              :items="levelOptions"
              placeholder="Todos los niveles"
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

    <!-- Table -->
    <v-card rounded="lg" elevation="1">
      <v-data-table
        :headers="headers"
        :items="filteredQuestions"
        :loading="loading"
        loading-text="Cargando preguntas..."
        no-data-text="No hay preguntas en esta materia"
        items-per-page-text="Filas por página"
        rounded="lg"
      >
        <template #item.level="{ item }">
          <v-chip :color="levelColor(item.level)" size="small" variant="tonal">{{ levelLabel(item.level) }}</v-chip>
        </template>
        <template #item.reward_credits="{ item }">
          <span class="text-success font-weight-medium">+{{ item.reward_credits }}</span>
          /
          <span class="text-error font-weight-medium">-{{ item.penalty_credits }}</span>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-eye" variant="text" size="small" color="info" @click="openPreview(item)" />
          <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="openEdit(item)" />
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="confirmDelete(item)" />
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="700" persistent scrollable>
      <v-card rounded="lg">
        <v-card-title class="pt-5 px-6">{{ editing ? 'Editar Pregunta' : 'Nueva Pregunta' }}</v-card-title>
        <v-card-text class="px-6">
          <v-form ref="formRef">
            <v-textarea
              v-model="form.question_text"
              label="Enunciado de la pregunta"
              variant="outlined"
              rounded="lg"
              rows="3"
              auto-grow
              :rules="[rules.required, rules.minLen(5)]"
              class="mb-3"
            />

            <v-row dense>
              <v-col cols="12" md="4">
                <v-select
                  v-model="form.level"
                  :items="levelOptions"
                  label="Nivel"
                  variant="outlined"
                  rounded="lg"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="6" md="4">
                <v-text-field
                  v-model.number="form.reward_credits"
                  label="Créditos correcta"
                  type="number"
                  variant="outlined"
                  rounded="lg"
                  :rules="[rules.required]"
                  prefix="+"
                />
              </v-col>
              <v-col cols="6" md="4">
                <v-text-field
                  v-model.number="form.penalty_credits"
                  label="Penalización"
                  type="number"
                  variant="outlined"
                  rounded="lg"
                  :rules="[rules.required]"
                  prefix="-"
                />
              </v-col>
            </v-row>

            <v-divider class="my-3" />
            <p class="text-subtitle-2 mb-3">Opciones de respuesta (mín. 2, máx. 6)</p>

            <div v-for="(option, i) in form.answer_options" :key="i" class="d-flex align-center gap-2 mb-2">
              <v-radio-group v-model="form.correct_answer_index" inline hide-details>
                <v-radio :value="i" color="success" />
              </v-radio-group>
              <v-text-field
                v-model="option.option_text"
                :label="`Opción ${i + 1}`"
                variant="outlined"
                rounded="lg"
                density="compact"
                hide-details
                :rules="[rules.required]"
                class="flex-1-1"
              />
              <v-btn
                v-if="form.answer_options.length > 2"
                icon="mdi-minus-circle"
                variant="text"
                size="small"
                color="error"
                @click="removeOption(i)"
              />
            </div>
            <v-btn
              v-if="form.answer_options.length < 6"
              variant="tonal"
              color="primary"
              size="small"
              prepend-icon="mdi-plus"
              class="mt-1 mb-3"
              @click="addOption"
            >
              Agregar opción
            </v-btn>

            <v-divider class="my-3" />

            <v-textarea
              v-model="form.correct_explanation"
              label="Explicación respuesta correcta"
              variant="outlined"
              rounded="lg"
              rows="2"
              auto-grow
              :rules="[rules.required, rules.minLen(5)]"
              class="mb-3"
            />
            <v-textarea
              v-model="form.incorrect_explanation"
              label="Explicación respuesta incorrecta"
              variant="outlined"
              rounded="lg"
              rows="2"
              auto-grow
              :rules="[rules.required, rules.minLen(5)]"
              class="mb-3"
            />
            <v-text-field
              v-model="form.image_url"
              label="URL de imagen (opcional)"
              variant="outlined"
              rounded="lg"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pb-4 pr-6">
          <v-spacer />
          <v-btn variant="text" rounded="lg" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="elevated" rounded="lg" :loading="saving" @click="saveQuestion">
            {{ editing ? 'Guardar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Preview Dialog -->
    <v-dialog v-model="previewDialog" max-width="560">
      <v-card v-if="previewQuestion" rounded="lg">
        <v-card-title class="pt-5 px-6 d-flex align-center gap-2">
          <v-chip :color="levelColor(previewQuestion.level)" size="small" variant="tonal">{{ levelLabel(previewQuestion.level) }}</v-chip>
          Vista previa
        </v-card-title>
        <v-card-text class="px-6">
          <p class="text-body-1 font-weight-medium mb-4">{{ previewQuestion.question_text }}</p>
          <v-list density="compact" rounded="lg" bg-color="grey-lighten-4">
            <v-list-item
              v-for="(opt, i) in previewQuestion.answer_options"
              :key="i"
              :prepend-icon="i === previewQuestion.correct_answer_index ? 'mdi-check-circle' : 'mdi-circle-outline'"
              :base-color="i === previewQuestion.correct_answer_index ? 'success' : ''"
            >
              {{ opt.option_text }}
            </v-list-item>
          </v-list>
          <v-divider class="my-3" />
          <p class="text-caption text-success mb-1"><strong>Correcta:</strong> {{ previewQuestion.correct_explanation }}</p>
          <p class="text-caption text-error"><strong>Incorrecta:</strong> {{ previewQuestion.incorrect_explanation }}</p>
        </v-card-text>
        <v-card-actions class="pb-4 pr-6">
          <v-spacer />
          <v-btn variant="text" rounded="lg" @click="previewDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <AppConfirmDialog
      v-model="confirmDialog"
      title="Eliminar pregunta"
      message="¿Seguro que deseas eliminar esta pregunta?"
      :loading="deleting"
      @confirm="deleteQuestion"
      @cancel="confirmDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'
import { useSnackbarStore } from '~/stores/snackbar'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const api = useApi()
const snackbar = useSnackbarStore()
const route = useRoute()
const router = useRouter()

const subjectId = computed(() => route.params.id as string)

interface AnswerOption { option_text: string; order_index: number }
interface Question {
  id: string
  question_text: string
  level: string
  reward_credits: number
  penalty_credits: number
  correct_answer_index: number
  correct_explanation: string
  incorrect_explanation: string
  answer_options: AnswerOption[]
  image_url?: string
}

const questions = ref<Question[]>([])
const subjectName = ref('')
const loading = ref(false)
const dialog = ref(false)
const confirmDialog = ref(false)
const previewDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const editing = ref(false)
const selectedQuestion = ref<Question | null>(null)
const previewQuestion = ref<Question | null>(null)
const formRef = ref()
const search = ref('')
const filterLevel = ref<string | null>(null)

const levelOptions = [
  { title: 'Básico', value: 'basico' },
  { title: 'Medio', value: 'medio' },
  { title: 'Avanzado', value: 'avanzado' },
]

const defaultForm = () => ({
  question_text: '',
  level: '',
  reward_credits: 10,
  penalty_credits: 5,
  correct_answer_index: 0,
  correct_explanation: '',
  incorrect_explanation: '',
  image_url: '',
  answer_options: [
    { option_text: '', order_index: 0 },
    { option_text: '', order_index: 1 },
  ],
})

const form = reactive(defaultForm())

const headers = [
  { title: 'Pregunta', key: 'question_text', sortable: false },
  { title: 'Nivel', key: 'level', sortable: true },
  { title: 'Créditos +/-', key: 'reward_credits', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' as const },
]

const rules = {
  required: (v: any) => (v !== null && v !== undefined && v !== '') || 'Campo requerido',
  minLen: (n: number) => (v: string) => (v && v.length >= n) || `Mínimo ${n} caracteres`,
}

const levelColor = (level: string) =>
  level === 'basico' ? 'success' : level === 'medio' ? 'warning' : 'error'

const levelLabel = (level: string) =>
  level === 'basico' ? 'Básico' : level === 'medio' ? 'Medio' : 'Avanzado'

const filteredQuestions = computed(() =>
  questions.value.filter((q) => {
    const matchSearch = !search.value || q.question_text.toLowerCase().includes(search.value.toLowerCase())
    const matchLevel = !filterLevel.value || q.level === filterLevel.value
    return matchSearch && matchLevel
  })
)

async function loadData() {
  loading.value = true
  try {
    const [qs, subject] = await Promise.all([
      api.get<Question[]>(`/subjects/${subjectId.value}/questions`),
      api.get<{ name: string }>(`/subjects/${subjectId.value}`),
    ])
    questions.value = qs
    subjectName.value = subject.name
  } catch (e: any) {
    snackbar.error(e?.message ?? 'Error al cargar preguntas')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = false
  Object.assign(form, defaultForm())
  dialog.value = true
}

function openEdit(q: Question) {
  editing.value = true
  selectedQuestion.value = q
  Object.assign(form, {
    question_text: q.question_text,
    level: q.level,
    reward_credits: q.reward_credits,
    penalty_credits: q.penalty_credits,
    correct_answer_index: q.correct_answer_index,
    correct_explanation: q.correct_explanation,
    incorrect_explanation: q.incorrect_explanation,
    image_url: q.image_url ?? '',
    answer_options: q.answer_options.map((o) => ({ ...o })),
  })
  dialog.value = true
}

function openPreview(q: Question) {
  previewQuestion.value = q
  previewDialog.value = true
}

function addOption() {
  form.answer_options.push({ option_text: '', order_index: form.answer_options.length })
}

function removeOption(index: number) {
  form.answer_options.splice(index, 1)
  form.answer_options.forEach((o, i) => (o.order_index = i))
  if (form.correct_answer_index >= form.answer_options.length) {
    form.correct_answer_index = form.answer_options.length - 1
  }
}

async function saveQuestion() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  saving.value = true
  try {
    const payload = {
      question_text: form.question_text,
      level: form.level,
      reward_credits: form.reward_credits,
      penalty_credits: form.penalty_credits,
      correct_answer_index: form.correct_answer_index,
      correct_explanation: form.correct_explanation,
      incorrect_explanation: form.incorrect_explanation,
      image_url: form.image_url || undefined,
      answer_options: form.answer_options,
    }
    if (editing.value && selectedQuestion.value) {
      await api.patch(`/subjects/${subjectId.value}/questions/${selectedQuestion.value.id}`, payload)
      snackbar.success('Pregunta actualizada')
    } else {
      await api.post(`/subjects/${subjectId.value}/questions`, payload)
      snackbar.success('Pregunta creada')
    }
    dialog.value = false
    await loadData()
  } catch (e: any) {
    snackbar.error(e?.message ?? 'Error al guardar pregunta')
  } finally {
    saving.value = false
  }
}

function confirmDelete(q: Question) {
  selectedQuestion.value = q
  confirmDialog.value = true
}

async function deleteQuestion() {
  if (!selectedQuestion.value) return
  deleting.value = true
  try {
    await api.del(`/subjects/${subjectId.value}/questions/${selectedQuestion.value.id}`)
    snackbar.success('Pregunta eliminada')
    confirmDialog.value = false
    await loadData()
  } catch (e: any) {
    snackbar.error(e?.message ?? 'Error al eliminar pregunta')
  } finally {
    deleting.value = false
  }
}

onMounted(loadData)
</script>
