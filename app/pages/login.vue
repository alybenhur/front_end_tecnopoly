<template>
  <div class="login-page">
    <div class="login-overlay" />

    <div class="login-layout">
      <section class="login-panel">
        <div class="brand">
          <div class="brand-icon">
            <v-icon size="28" color="white">mdi-controller-classic</v-icon>
          </div>
          <div>
            <div class="brand-name">Tecnopoly</div>
            <div class="brand-sub">Panel de Administración</div>
          </div>
        </div>

        <h1 class="login-title">Bienvenido de nuevo</h1>
        <p class="login-text">Inicia sesión para gestionar usuarios, materias y preguntas del juego.</p>

        <v-alert
          v-if="errorMsg"
          type="error"
          variant="tonal"
          rounded="lg"
          density="compact"
          class="mb-4"
          closable
          @click:close="errorMsg = ''"
        >
          {{ errorMsg }}
        </v-alert>

        <v-form ref="formRef" @submit.prevent="handleLogin">
          <label class="field-label" for="login-email">Correo electrónico</label>
          <v-text-field
            id="login-email"
            v-model="form.email"
            placeholder="tu@correo.com"
            type="email"
            autocomplete="email"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            :rules="[rules.required, rules.email]"
            class="mb-2"
            autofocus
          />
          <label class="field-label" for="login-password">Contraseña</label>
          <v-text-field
            id="login-password"
            v-model="form.password"
            placeholder="••••••••"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            variant="outlined"
            density="comfortable"
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
            class="login-btn"
            :loading="loading"
            append-icon="mdi-arrow-right"
          >
            Iniciar sesión
          </v-btn>
        </v-form>

        <p class="login-footer">© {{ year }} Tecnopoly · Universidad de Córdoba</p>
      </section>

    </div>
  </div>
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
const year = new Date().getFullYear()

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
.login-page {
  position: relative;
  min-height: 100vh;
  background: #0b1e3f url('/login-bg.webp') center / cover no-repeat;
  overflow: hidden;
}

/* Oscurece el lado del formulario y deja ver la escena a la derecha */
.login-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(8, 20, 45, 0.78) 0%, rgba(8, 20, 45, 0.45) 38%, rgba(8, 20, 45, 0) 65%),
    linear-gradient(0deg, rgba(8, 20, 45, 0.55) 0%, rgba(8, 20, 45, 0) 35%);
}

.login-layout {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 48px clamp(16px, 6vw, 96px);
}

.login-panel {
  width: 100%;
  max-width: 420px;
  padding: 40px 36px 28px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  box-shadow: 0 24px 60px rgba(8, 20, 45, 0.35);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}
.brand-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #1565C0, #42A5F5);
  box-shadow: 0 8px 18px rgba(21, 101, 192, 0.35);
}
.brand-name {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f2a52;
  line-height: 1.1;
}
.brand-sub {
  font-size: 0.8rem;
  color: #64748b;
}

.login-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 6px;
}
.login-text {
  font-size: 0.92rem;
  color: #64748b;
  margin-bottom: 24px;
}

.field-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.login-btn {
  font-weight: 700;
  letter-spacing: 0.2px;
  text-transform: none;
  box-shadow: 0 10px 22px rgba(21, 101, 192, 0.35);
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 0.75rem;
  color: #94a3b8;
}



@media (max-width: 600px) {
  .login-page { background-position: 80% center; }
  .login-overlay { background: rgba(8, 20, 45, 0.45); }
  .login-layout { justify-content: center; padding: 24px 16px; }
  .login-panel { padding: 32px 22px 22px; border-radius: 20px; }
}
</style>
