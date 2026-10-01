<template>
  <div>
    <!-- Con imagen: vista previa + acciones -->
    <div v-if="url" class="image-box rounded-lg mb-2">
      <v-img :src="previewUrl" max-height="260" contain class="rounded-lg" />
      <div class="d-flex align-center gap-2 mt-2">
        <v-chip size="small" color="success" variant="tonal" prepend-icon="mdi-check-circle">Imagen lista</v-chip>
        <v-spacer />
        <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-image-edit" :disabled="uploading" @click="pickFile">
          Cambiar
        </v-btn>
        <v-btn size="small" variant="text" color="error" prepend-icon="mdi-delete" :disabled="uploading" @click="clear">
          Quitar
        </v-btn>
      </div>
    </div>

    <!-- Sin imagen: zona para arrastrar o elegir -->
    <div
      v-else
      class="drop-zone rounded-lg d-flex flex-column align-center justify-center pa-6 mb-2"
      :class="{ 'drop-zone--over': dragging, 'drop-zone--error': !!error }"
      @click="pickFile"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <v-icon size="40" color="primary" class="mb-2">mdi-image-plus</v-icon>
      <p class="text-body-2 mb-1">Arrastra la imagen aquí o <strong class="text-primary">haz clic para elegirla</strong></p>
      <p class="text-caption text-medium-emphasis">JPG, PNG o WEBP · máximo 5 MB</p>
    </div>

    <v-progress-linear v-if="uploading" :model-value="progress" color="primary" height="6" rounded class="mb-2" />
    <p v-if="uploading" class="text-caption text-medium-emphasis mb-2">Subiendo imagen… {{ progress }}%</p>
    <p v-if="error" class="text-caption text-error mb-2">{{ error }}</p>

    <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="d-none" @change="onFileChange" />
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'

/**
 * Imagen de una pregunta: se sube directo del navegador a Cloudinary con una
 * firma que da el backend (el secreto nunca llega al navegador). Emite el
 * public_id y la URL; la pregunta se guarda después con ese public_id.
 */
const props = defineProps<{
  subjectId: string
  publicId: string
  url: string
}>()

const emit = defineEmits<{
  'update:publicId': [value: string]
  'update:url': [value: string]
  /** Cada imagen subida en esta sesión del formulario (para descartar las que no se usen). */
  uploaded: [publicId: string]
}>()

const MAX_BYTES = 5 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

const api = useApi()
const fileInput = ref<HTMLInputElement>()
const dragging = ref(false)
const uploading = ref(false)
const progress = ref(0)
const error = ref('')

// Vista previa reducida que entrega Cloudinary (más liviana que el original)
const previewUrl = computed(() =>
  props.url.includes('/upload/') ? props.url.replace('/upload/', '/upload/c_limit,w_800,f_auto,q_auto/') : props.url
)

interface Signature {
  upload_url: string
  api_key: string
  timestamp: number
  signature: string
  folder: string
  allowed_formats: string
  max_bytes: number
}

function pickFile() {
  if (!uploading.value) fileInput.value?.click()
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) upload(file)
  if (fileInput.value) fileInput.value.value = '' // permitir elegir el mismo archivo otra vez
}

function onDrop(e: DragEvent) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) upload(file)
}

function validate(file: File): string {
  if (!TYPES.includes(file.type)) return 'Formato no permitido. Usa JPG, PNG o WEBP.'
  if (file.size > MAX_BYTES) return `La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB; el máximo es 5 MB.`
  return ''
}

async function upload(file: File) {
  error.value = validate(file)
  if (error.value) return

  uploading.value = true
  progress.value = 0
  try {
    const sig = await api.post<Signature>(`/subjects/${props.subjectId}/questions/image-signature`, {})
    const result = await sendToCloudinary(file, sig)
    emit('update:publicId', result.public_id)
    emit('update:url', result.secure_url)
    emit('uploaded', result.public_id)
  } catch (e: any) {
    error.value = e?.message ?? 'No se pudo subir la imagen'
  } finally {
    uploading.value = false
  }
}

// XMLHttpRequest en lugar de fetch para poder mostrar el progreso de subida
function sendToCloudinary(file: File, sig: Signature): Promise<{ public_id: string; secure_url: string }> {
  return new Promise((resolve, reject) => {
    const data = new FormData()
    data.append('file', file)
    data.append('api_key', sig.api_key)
    data.append('timestamp', String(sig.timestamp))
    data.append('signature', sig.signature)
    data.append('folder', sig.folder)
    data.append('allowed_formats', sig.allowed_formats)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', sig.upload_url)
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) progress.value = Math.round((ev.loaded / ev.total) * 100)
    }
    xhr.onload = () => {
      let body: any = {}
      try { body = JSON.parse(xhr.responseText) } catch { /* respuesta vacía */ }
      if (xhr.status >= 200 && xhr.status < 300 && body.public_id) resolve(body)
      else reject(new Error(body?.error?.message ? `Cloudinary: ${body.error.message}` : `Error ${xhr.status} al subir la imagen`))
    }
    xhr.onerror = () => reject(new Error('Sin conexión con Cloudinary'))
    xhr.send(data)
  })
}

function clear() {
  emit('update:publicId', '')
  emit('update:url', '')
  error.value = ''
}
</script>

<style scoped>
.drop-zone {
  border: 2px dashed rgba(var(--v-theme-primary), 0.4);
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
  min-height: 150px;
}
.drop-zone:hover,
.drop-zone--over {
  background-color: rgba(var(--v-theme-primary), 0.06);
  border-color: rgb(var(--v-theme-primary));
}
.drop-zone--error {
  border-color: rgb(var(--v-theme-error));
}
.image-box {
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 8px;
}
</style>
