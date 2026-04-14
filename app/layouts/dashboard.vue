<template>
  <v-app>
    <!-- Sidebar -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      color="primary"
    >
      <!-- Logo / Header -->
      <v-list-item
        prepend-icon="mdi-controller-classic"
        title="Tecnopoly"
        nav
        class="py-4"
      >
        <template #append>
          <v-btn
            :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
            variant="text"
            color="white"
            @click="rail = !rail"
          />
        </template>
      </v-list-item>

      <v-divider color="rgba(255,255,255,0.3)" />

      <!-- Role badge -->
      <v-list-item v-if="!rail" class="mt-2">
        <v-chip
          :color="authStore.isAdmin ? 'warning' : 'success'"
          size="small"
          variant="elevated"
          prepend-icon="mdi-shield-account"
        >
          {{ authStore.isAdmin ? 'Administrador' : 'Profesor' }}
        </v-chip>
      </v-list-item>

      <!-- Nav items -->
      <v-list density="compact" nav class="mt-2">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          active-color="white"
          rounded="lg"
          class="mb-1"
        />
      </v-list>

      <template #append>
        <v-divider color="rgba(255,255,255,0.3)" />
        <v-list density="compact" nav class="py-2">
          <v-list-item
            prepend-icon="mdi-logout"
            title="Cerrar sesión"
            rounded="lg"
            @click="handleLogout"
          />
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- Top bar -->
    <v-app-bar elevation="1" color="white">
      <v-app-bar-title>
        <span class="text-primary font-weight-bold">{{ currentPageTitle }}</span>
      </v-app-bar-title>
      <template #append>
        <v-chip
          prepend-icon="mdi-account-circle"
          variant="tonal"
          color="primary"
          class="mr-3"
        >
          {{ authStore.user?.name }}
        </v-chip>
      </template>
    </v-app-bar>

    <!-- Main content -->
    <v-main>
      <v-container fluid class="pa-6">
        <slot />
      </v-container>
    </v-main>

    <!-- Global snackbar -->
    <AppSnackbar />
  </v-app>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useRoleNav } from '~/composables/useRoleNav'

const authStore = useAuthStore()
authStore.loadFromStorage()

const { navItems } = useRoleNav()
const router = useRouter()
const route = useRoute()

const drawer = ref(true)
const rail = ref(false)

const currentPageTitle = computed(() => {
  const matched = navItems.value.find((item) => route.path.startsWith(item.to) && item.to !== '/dashboard')
    ?? navItems.value.find((item) => item.to === '/dashboard')
  return matched?.title ?? 'Dashboard'
})

async function handleLogout() {
  authStore.logout()
  await router.push('/login')
}
</script>
