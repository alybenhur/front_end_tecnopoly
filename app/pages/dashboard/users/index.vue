<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold text-primary">Usuarios</h1>
        <p class="text-medium-emphasis text-body-2 mt-1">Gestión de administradores y profesores</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg" @click="openCreate">
        Nuevo Usuario
      </v-btn>
    </div>

    <!-- Filters -->
    <v-card rounded="lg" elevation="1" class="mb-4">
      <v-card-text class="pb-3">
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              placeholder="Buscar por nombre o correo..."
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
              v-model="filterRole"
              :items="roleOptions"
              placeholder="Todos los roles"
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
        :items="filteredUsers"
        :loading="loading"
        loading-text="Cargando usuarios..."
        no-data-text="No hay usuarios registrados"
        items-per-page-text="Filas por página"
        rounded="lg"
      >
        <template #item.role="{ item }">
          <v-chip
            :color="item.role === 'admin' ? 'warning' : 'success'"
            size="small"
            variant="tonal"
          >
            {{ item.role === 'admin' ? 'Administrador' : 'Profesor' }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="openEdit(item)" />
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="confirmDelete(item)" />
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500" persistent>
      <v-card rounded="lg">
        <v-card-title class="pt-5 px-6">
          {{ editing ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </v-card-title>
        <v-card-text class="px-6">
          <v-form ref="formRef" @submit.prevent="saveUser">
            <v-text-field
              v-model="form.name"
              label="Nombre completo"
              variant="outlined"
              rounded="lg"
              :rules="[rules.required, rules.minLen(2)]"
              class="mb-3"
            />
            <v-text-field
              v-model="form.email"
              label="Correo electrónico"
              type="email"
              variant="outlined"
              rounded="lg"
              :rules="[rules.required, rules.email]"
              class="mb-3"
            />
            <v-text-field
              v-model="form.password"
              :label="editing ? 'Nueva contraseña (dejar en blanco para no cambiar)' : 'Contraseña'"
              type="password"
              variant="outlined"
              rounded="lg"
              :rules="editing ? [] : [rules.required, rules.minLen(6)]"
              class="mb-3"
            />
            <v-select
              v-model="form.role"
              :items="roleOptions"
              label="Rol"
              variant="outlined"
              rounded="lg"
              :rules="[rules.required]"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pb-4 pr-6">
          <v-spacer />
          <v-btn variant="text" rounded="lg" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="elevated" rounded="lg" :loading="saving" @click="saveUser">
            {{ editing ? 'Guardar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Delete -->
    <AppConfirmDialog
      v-model="confirmDialog"
      title="Eliminar usuario"
      :message="`¿Seguro que deseas eliminar a ${selectedUser?.name}? Esta acción no se puede deshacer.`"
      :loading="deleting"
      @confirm="deleteUser"
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

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'profesor'
}

const users = ref<User[]>([])
const loading = ref(false)
const dialog = ref(false)
const confirmDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const editing = ref(false)
const selectedUser = ref<User | null>(null)
const formRef = ref()
const search = ref('')
const filterRole = ref<string | null>(null)

const form = reactive({ name: '', email: '', password: '', role: '' })

const headers = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Correo', key: 'email', sortable: true },
  { title: 'Rol', key: 'role', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' as const },
]

const roleOptions = [
  { title: 'Administrador', value: 'admin' },
  { title: 'Profesor', value: 'profesor' },
]

const rules = {
  required: (v: string) => !!v || 'Campo requerido',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Correo inválido',
  minLen: (n: number) => (v: string) => (v && v.length >= n) || `Mínimo ${n} caracteres`,
}

const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    const matchSearch = !search.value || u.name.toLowerCase().includes(search.value.toLowerCase()) || u.email.toLowerCase().includes(search.value.toLowerCase())
    const matchRole = !filterRole.value || u.role === filterRole.value
    return matchSearch && matchRole
  })
})

async function loadUsers() {
  loading.value = true
  try {
    users.value = await api.get<User[]>('/users')
  } catch (e: any) {
    snackbar.error(e?.message ?? 'Error al cargar usuarios')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = false
  Object.assign(form, { name: '', email: '', password: '', role: '' })
  dialog.value = true
}

function openEdit(user: User) {
  editing.value = true
  selectedUser.value = user
  Object.assign(form, { name: user.name, email: user.email, password: '', role: user.role })
  dialog.value = true
}

async function saveUser() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  try {
    if (editing.value && selectedUser.value) {
      const payload: any = { name: form.name, email: form.email, role: form.role }
      if (form.password) payload.password = form.password
      await api.patch(`/users/${selectedUser.value.id}`, payload)
      snackbar.success('Usuario actualizado')
    } else {
      await api.post('/users', { name: form.name, email: form.email, password: form.password, role: form.role })
      snackbar.success('Usuario creado')
    }
    dialog.value = false
    await loadUsers()
  } catch (e: any) {
    snackbar.error(e?.message ?? 'Error al guardar usuario')
  } finally {
    saving.value = false
  }
}

function confirmDelete(user: User) {
  selectedUser.value = user
  confirmDialog.value = true
}

async function deleteUser() {
  if (!selectedUser.value) return
  deleting.value = true
  try {
    await api.del(`/users/${selectedUser.value.id}`)
    snackbar.success('Usuario eliminado')
    confirmDialog.value = false
    await loadUsers()
  } catch (e: any) {
    snackbar.error(e?.message ?? 'Error al eliminar usuario')
  } finally {
    deleting.value = false
  }
}

onMounted(loadUsers)
</script>
