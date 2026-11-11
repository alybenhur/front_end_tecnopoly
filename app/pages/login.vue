<template>
  <div class="login-page">
    <div class="login-overlay" />

    <div class="login-layout">
      <!-- Tarjeta con forma de control de videojuego -->
      <section class="pad">
        <span class="bumper bumper--left" />
        <span class="bumper bumper--right" />

        <!-- Decoración superior -->
        <v-icon class="deco deco--star" size="30">mdi-star</v-icon>
        <v-icon class="deco deco--home" size="32">mdi-home</v-icon>

        <!-- Cruceta (izquierda) -->
        <div class="side side--left" aria-hidden="true">
          <div class="dpad">
            <span class="dpad-v" />
            <span class="dpad-h" />
            <span class="dpad-dot" />
          </div>
        </div>

        <!-- Botones de acción (derecha) -->
        <div class="side side--right" aria-hidden="true">
          <div class="actions">
            <span class="act act--top"><v-icon size="13">mdi-triangle</v-icon></span>
            <span class="act act--left"><v-icon size="13">mdi-circle</v-icon></span>
            <span class="act act--right"><v-icon size="13">mdi-square</v-icon></span>
            <span class="act act--bottom"><v-icon size="15">mdi-close-thick</v-icon></span>
          </div>
        </div>

        <!-- Formulario -->
        <div class="pad-center">
          <v-icon class="pad-logo" size="40">mdi-controller-classic</v-icon>
          <h1 class="pad-title">Tecnopoly</h1>
          <p class="pad-tagline">Conocimiento en cada movimiento</p>

          <v-alert
            v-if="errorMsg"
            type="error"
            variant="tonal"
            rounded="lg"
            density="compact"
            class="mb-3 text-left"
            closable
            @click:close="errorMsg = ''"
          >
            {{ errorMsg }}
          </v-alert>

          <v-form ref="formRef" @submit.prevent="handleLogin">
            <v-text-field
              v-model="form.email"
              placeholder="Correo electrónico"
              aria-label="Correo electrónico"
              type="email"
              autocomplete="email"
              variant="solo"
              flat
              density="comfortable"
              rounded="lg"
              :rules="[rules.required, rules.email]"
              class="pad-field mb-1"
              autofocus
            >
              <template #prepend-inner>
                <v-icon color="#e53935">mdi-email-outline</v-icon>
              </template>
            </v-text-field>

            <v-text-field
              v-model="form.password"
              placeholder="Contraseña"
              aria-label="Contraseña"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              variant="solo"
              flat
              density="comfortable"
              rounded="lg"
              :rules="[rules.required]"
              class="pad-field mb-2"
              @click:append-inner="showPassword = !showPassword"
            />

            <v-btn
              type="submit"
              size="large"
              block
              rounded="lg"
              class="pad-btn"
              :loading="loading"
            >
              Iniciar Sesión
            </v-btn>
          </v-form>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'auth' })

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap' },
  ],
})

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
.login-page {
  position: relative;
  min-height: 100vh;
  background: #0b1e3f url('/login-bg.webp') center / cover no-repeat;
  overflow: hidden;
}

.login-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(8, 20, 45, 0.55) 0%, rgba(8, 20, 45, 0.25) 45%, rgba(8, 20, 45, 0) 70%),
    linear-gradient(0deg, rgba(8, 20, 45, 0.4) 0%, rgba(8, 20, 45, 0) 35%);
}

.login-layout {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 48px clamp(16px, 5vw, 80px);
}

/* ── Cuerpo del control ─────────────────────────────── */
.pad {
  --pad-bg: #dde8f6;
  --pad-edge: #2f6fd6;
  --pad-ink: #1d4fb8;
  position: relative;
  width: 100%;
  max-width: 600px;
  padding: 40px 150px 34px;
  background: linear-gradient(180deg, #e9f1fb 0%, var(--pad-bg) 100%);
  border: 3px solid var(--pad-edge);
  border-radius: 36px 36px 48px 48px;
  box-shadow:
    0 6px 0 #1f56b3,
    0 26px 50px rgba(8, 20, 45, 0.45),
    inset 0 2px 0 rgba(255, 255, 255, 0.9);
  text-align: center;
}

/* Gatillos superiores (bumpers) */
.bumper {
  position: absolute;
  top: -12px;
  width: 120px;
  height: 30px;
  background: var(--pad-edge);
  z-index: -1;
}
.bumper--left {
  left: 10px;
  border-radius: 26px 14px 0 0;
}
.bumper--right {
  right: 10px;
  border-radius: 14px 26px 0 0;
}

.deco {
  position: absolute;
  top: 70px;
}
.deco--star {
  left: 58px;
  color: #f5a623 !important;
  filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.12));
}
.deco--home {
  right: 56px;
  color: var(--pad-ink) !important;
}

/* Zonas laterales */
.side {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  margin-top: 46px;
}
.side--left {
  left: 22px;
}
.side--right {
  right: 22px;
}

/* Cruceta */
.dpad {
  position: relative;
  width: 104px;
  height: 104px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #f3f7fd, #c9d7ea);
  box-shadow: inset 0 3px 6px rgba(15, 23, 42, 0.18), 0 2px 0 rgba(255, 255, 255, 0.8);
}
.dpad-v,
.dpad-h {
  position: absolute;
  left: 50%;
  top: 50%;
  background: #1e293b;
  border-radius: 6px;
  box-shadow: 0 3px 0 #0b1220;
}
.dpad-v {
  width: 24px;
  height: 66px;
  transform: translate(-50%, -50%);
}
.dpad-h {
  width: 66px;
  height: 24px;
  transform: translate(-50%, -50%);
}
.dpad-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #334155;
  transform: translate(-50%, -50%);
}

/* Botones de acción */
.actions {
  position: relative;
  width: 104px;
  height: 104px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #f3f7fd, #c9d7ea);
  box-shadow: inset 0 3px 6px rgba(15, 23, 42, 0.18), 0 2px 0 rgba(255, 255, 255, 0.8);
}
.act {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.25), inset 0 2px 0 rgba(255, 255, 255, 0.35);
}
.act--top { top: 8px; left: 36px; background: #2e9d57; }
.act--left { top: 36px; left: 8px; background: #e53935; }
.act--right { top: 36px; right: 8px; background: #1e6fe0; }
.act--bottom { bottom: 8px; left: 36px; background: #f5a623; }

/* ── Contenido central ──────────────────────────────── */
.pad-logo {
  color: var(--pad-ink) !important;
}
.pad-title {
  margin-top: 4px;
  font-family: 'Fredoka', 'Nunito', system-ui, sans-serif;
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.1;
  color: var(--pad-ink);
  letter-spacing: 0.01em;
}
.pad-tagline {
  margin: 8px 0 18px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
}

.pad-field :deep(.v-field) {
  background: #fff !important;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08) !important;
}
.pad-field :deep(.v-messages) {
  text-align: left;
}

.pad-btn {
  margin-top: 4px;
  background: linear-gradient(180deg, #2f6fe8, #1d4fc4) !important;
  color: #fff !important;
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0;
  box-shadow: 0 4px 0 #163e9c, 0 10px 18px rgba(29, 79, 196, 0.35) !important;
}
.pad-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #163e9c !important;
}

/* ── Pantallas medianas: control más compacto ───────── */
@media (max-width: 680px) {
  .login-layout {
    justify-content: center;
    padding: 32px 16px;
  }
  .pad {
    padding: 36px 22px 28px;
    border-radius: 30px;
  }
  .side {
    display: none;
  }
  .deco {
    top: 26px;
  }
  .deco--star { left: 24px; }
  .deco--home { right: 22px; }
  .bumper {
    width: 90px;
  }
}

@media (max-width: 600px) {
  .login-page {
    background-position: 80% center;
  }
  .login-overlay {
    background: rgba(8, 20, 45, 0.45);
  }
}
</style>
