<template>
  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
    location="bottom right"
    rounded="lg"
    elevation="4"
  >
    <v-icon class="mr-2">
      {{ snackbar.color === 'success' ? 'mdi-check-circle' : snackbar.color === 'error' ? 'mdi-alert-circle' : 'mdi-information' }}
    </v-icon>
    {{ snackbar.message }}
    <template #actions>
      <v-btn variant="text" icon="mdi-close" @click="snackbar.show = false" />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { useSnackbarStore } from '~/stores/snackbar'
const snackbar = useSnackbarStore()
</script>
