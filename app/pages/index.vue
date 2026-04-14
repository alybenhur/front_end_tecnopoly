<template>
  <div />
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: false })

const authStore = useAuthStore()
authStore.loadFromStorage()

if (authStore.isAuthenticated) {
  if (authStore.isAdmin) {
    await navigateTo('/dashboard')
  } else {
    await navigateTo('/dashboard/my-subjects')
  }
} else {
  await navigateTo('/login')
}
</script>
