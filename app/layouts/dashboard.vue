<template>
  <v-app class="panel-app">
    <!-- Sidebar -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail && !mobile"
      :permanent="!mobile"
      :temporary="mobile"
      width="268"
      class="panel-drawer"
    >
      <!-- Marca -->
      <div class="brand" :class="{ 'brand--rail': rail && !mobile }">
        <div class="brand-logo">
          <v-icon size="22" color="white">mdi-controller-classic</v-icon>
        </div>
        <div v-if="!rail || mobile" class="brand-text">
          <div class="brand-name">Tecnopoly</div>
          <div class="brand-role">{{ authStore.isAdmin ? 'Administración' : 'Panel docente' }}</div>
        </div>
      </div>

      <!-- Navegación -->
      <div v-if="!rail || mobile" class="nav-label">Menú</div>
      <v-list density="comfortable" nav class="px-3">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          :exact="item.to === '/dashboard'"
          color="primary"
          rounded="lg"
          class="nav-item mb-1"
        />
      </v-list>

      <template #append>
        <!-- Tarjeta del juego -->
        <div v-if="!rail || mobile" class="game-card">
          <img src="/img/tablero.webp" alt="Tablero de Tecnopoly" class="game-card-img">
          <div class="game-card-body">
            <div class="game-card-title">Tus preguntas en el tablero</div>
            <div class="game-card-text">Cada pregunta que crees aparece en las casillas del juego.</div>
          </div>
        </div>

        <!-- Usuario -->
        <div class="user-block" :class="{ 'user-block--rail': rail && !mobile }">
          <v-avatar color="primary" size="38" class="user-avatar">
            <span class="text-caption font-weight-bold">{{ initials(authStore.user?.name) }}</span>
          </v-avatar>
          <div v-if="!rail || mobile" class="user-info">
            <div class="user-name">{{ authStore.user?.name }}</div>
            <div class="user-mail">{{ authStore.user?.email }}</div>
          </div>
          <v-btn
            v-if="!rail || mobile"
            icon="mdi-logout"
            variant="text"
            size="small"
            color="grey-darken-1"
            title="Cerrar sesión"
            @click="handleLogout"
          />
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Barra superior -->
    <v-app-bar flat height="68" class="panel-bar">
      <v-btn
        :icon="mobile ? 'mdi-menu' : (rail ? 'mdi-menu-open' : 'mdi-menu')"
        variant="text"
        color="grey-darken-2"
        class="ml-2"
        @click="toggleDrawer"
      />
      <div class="bar-crumbs">
        <span class="crumb-root">Panel</span>
        <v-icon size="16" color="grey">mdi-chevron-right</v-icon>
        <span class="crumb-current">{{ currentPageTitle }}</span>
      </div>
      <template #append>
        <v-chip
          :color="authStore.isAdmin ? 'warning' : 'success'"
          variant="tonal"
          size="small"
          prepend-icon="mdi-shield-account"
          class="mr-3 d-none d-sm-flex font-weight-bold"
        >
          {{ authStore.isAdmin ? 'Administrador' : 'Profesor' }}
        </v-chip>
        <v-menu location="bottom end" offset="8">
          <template #activator="{ props }">
            <v-btn v-bind="props" variant="text" class="mr-3 px-2" height="44" rounded="lg">
              <v-avatar color="primary" size="32">
                <span class="text-caption font-weight-bold">{{ initials(authStore.user?.name) }}</span>
              </v-avatar>
              <span class="ml-2 d-none d-md-inline text-body-2 font-weight-bold">{{ authStore.user?.name }}</span>
              <v-icon size="18" class="ml-1">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-card min-width="240" class="pa-2">
            <div class="px-3 py-2">
              <div class="text-body-2 font-weight-bold">{{ authStore.user?.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ authStore.user?.email }}</div>
            </div>
            <v-divider class="my-1" />
            <v-list density="compact" nav class="pa-0">
              <v-list-item prepend-icon="mdi-logout" title="Cerrar sesión" rounded="lg" @click="handleLogout" />
            </v-list>
          </v-card>
        </v-menu>
      </template>
    </v-app-bar>

    <!-- Contenido -->
    <v-main class="panel-main">
      <div class="panel-content">
        <slot />
      </div>
    </v-main>

    <AppSnackbar />
  </v-app>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { useAuthStore } from '~/stores/auth'
import { useRoleNav } from '~/composables/useRoleNav'
import { initials } from '~/composables/useGameArt'

const authStore = useAuthStore()
authStore.loadFromStorage()

const { navItems } = useRoleNav()
const router = useRouter()
const route = useRoute()
const { mobile } = useDisplay({ mobileBreakpoint: 'md' })

const drawer = ref(true)
const rail = ref(false)

watch(mobile, (m) => { drawer.value = !m }, { immediate: true })

function toggleDrawer() {
  if (mobile.value) drawer.value = !drawer.value
  else rail.value = !rail.value
}

const currentPageTitle = computed(() => {
  if (route.path.includes('/questions')) return 'Preguntas'
  const matched = navItems.value.find((item) => route.path.startsWith(item.to) && item.to !== '/dashboard')
    ?? navItems.value.find((item) => item.to === '/dashboard')
  return matched?.title ?? 'Inicio'
})

async function handleLogout() {
  authStore.logout()
  await router.push('/login')
}
</script>

<style scoped>
.panel-drawer {
  border-right: 1px solid var(--tp-line) !important;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 68px;
  padding: 0 20px;
  border-bottom: 1px solid var(--tp-line);
}
.brand--rail {
  padding: 0;
  justify-content: center;
}
.brand-logo {
  flex: none;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #1565c0, #42a5f5);
  box-shadow: 0 6px 14px rgba(21, 101, 192, 0.3);
}
.brand-name {
  font-weight: 800;
  font-size: 1.05rem;
  color: var(--tp-ink);
  line-height: 1.1;
}
.brand-role {
  font-size: 0.75rem;
  color: var(--tp-muted);
}

.nav-label {
  padding: 22px 24px 8px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
}
.nav-item :deep(.v-list-item-title) {
  font-weight: 600;
  font-size: 0.92rem;
}
.nav-item:not(.v-list-item--active) :deep(.v-list-item__prepend .v-icon) {
  color: #64748b;
  opacity: 1;
}

.game-card {
  margin: 0 14px 14px;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(160deg, #0b2a5b, #1565c0);
  color: #fff;
}
.game-card-img {
  display: block;
  width: 100%;
  height: 96px;
  object-fit: cover;
  object-position: center 40%;
}
.game-card-body {
  padding: 12px 14px 14px;
}
.game-card-title {
  font-weight: 700;
  font-size: 0.88rem;
}
.game-card-text {
  margin-top: 2px;
  font-size: 0.75rem;
  opacity: 0.8;
  line-height: 1.35;
}

.user-block {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 14px 14px 18px;
  border-top: 1px solid var(--tp-line);
}
.user-block--rail {
  justify-content: center;
  padding: 14px 0;
}
.user-avatar {
  flex: none;
}
.user-info {
  min-width: 0;
  flex: 1;
}
.user-name {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--tp-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-mail {
  font-size: 0.72rem;
  color: var(--tp-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panel-bar {
  background: rgba(255, 255, 255, 0.92) !important;
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--tp-line) !important;
}
.bar-crumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 6px;
  font-size: 0.9rem;
}
.crumb-root {
  color: var(--tp-muted);
}
.crumb-current {
  font-weight: 700;
  color: var(--tp-ink);
}

.panel-main {
  background: var(--tp-bg);
  min-height: 100vh;
}
.panel-content {
  max-width: 1320px;
  margin: 0 auto;
  padding: 28px clamp(16px, 3vw, 36px) 48px;
}
</style>
