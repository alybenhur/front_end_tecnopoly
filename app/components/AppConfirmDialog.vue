<template>
  <v-dialog :model-value="modelValue" max-width="420" persistent @update:model-value="emit('update:modelValue', $event)">
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center gap-2 pt-5">
        <v-icon color="error">mdi-alert-circle-outline</v-icon>
        {{ title }}
      </v-card-title>
      <v-card-text class="text-medium-emphasis">{{ message }}</v-card-text>
      <v-card-actions class="pb-4 pr-4">
        <v-spacer />
        <v-btn variant="text" rounded="lg" @click="emit('cancel')">Cancelar</v-btn>
        <v-btn color="error" variant="elevated" rounded="lg" :loading="loading" @click="emit('confirm')">
          Eliminar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  title?: string
  message?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()
</script>
