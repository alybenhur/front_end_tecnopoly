<template>
  <v-container fluid class="fill-height login-bg">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card elevation="8" rounded="lg" class="pa-2">
          <v-card-title class="text-center pt-6 pb-2">
            <v-icon size="48" color="primary" class="mb-2 d-block mx-auto">mdi-controller-classic</v-icon>
            <div class="text-h5 font-weight-bold text-primary">Tecnopoly</div>
            <div class="text-subtitle-2 text-medium-emphasis mt-1">Panel de Administración</div>
          </v-card-title>

          <v-card-text class="pt-4">
            <v-alert
              v-if="errorMsg"
              type="error"
              variant="tonal"
              rounded="lg"
              class="mb-4"
              closable
              @click:close="errorMsg = ''"
            >
              {{ errorMsg }}
            </v-alert>

            <v-form ref="formRef" @submit.prevent="handleLogin">
              <v-text-field
                v-model="form.email"
                label="Correo electrónico"
                type="email"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                rounded="lg"
                :rules="[rules.required, rules.email]"
                class="mb-3"
                autofocus
              />
              <v-text-field
                v-model="form.password"
                label="Contraseña"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                variant="outlined"
                rounded="lg"
                :rules="[rules.required]"
                class="mb-4"
                @click:append-inner="showPassword = !showPassword"
              />
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                rounded="lg"
                :loading="loading"
              >
                Iniciar Sesión
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const api = useApi()
const router = useRouter()

const formRef = ref()
const loading = ref(false)
const errorMsg = ref('')
const showPassword = ref(false)

const form = reactive({ email: '', password: '' })

const rules = {
  required: (v: string) => !!v || 'Campo requerido',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Correo inválido',
}

async function handleLogin() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  errorMsg.value = ''
  try {
    const data = await api.post<{ access_token: string; user: any }>('/auth/login', {
      email: form.email,
      password: form.password,
    })
    authStore.setAuth(data.access_token, data.user)

    if (authStore.isAdmin) {
      await router.push('/dashboard')
    } else {
      await router.push('/dashboard/my-subjects')
    }
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-bg {
  background: linear-gradient(135deg, #1565C0 0%, #42A5F5 100%);
  min-height: 100vh;
}
</style>
