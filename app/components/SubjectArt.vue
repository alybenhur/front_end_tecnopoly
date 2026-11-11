<template>
  <div
    class="subject-art"
    :style="{ width: `${size}px`, height: `${size}px`, '--art': art.color, borderRadius: `${Math.round(size / 7)}px` }"
  >
    <img v-if="art.src" :src="art.src" :alt="name ?? ''">
    <v-icon v-else :size="Math.round(size * 0.52)" color="white">{{ art.icon }}</v-icon>
  </div>
</template>

<script setup lang="ts">
import { subjectArt } from '~/composables/useGameArt'

const props = withDefaults(defineProps<{ name?: string; description?: string; size?: number }>(), { size: 56 })
const art = computed(() => subjectArt(props.name, props.description))
</script>

<style scoped>
.subject-art {
  flex: none;
  display: grid;
  place-items: center;
  overflow: hidden;
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.3), transparent 55%),
    var(--art);
}
.subject-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
