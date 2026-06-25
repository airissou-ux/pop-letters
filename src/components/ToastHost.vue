<script setup>
import { useUiStore } from '@/stores/ui'
const ui = useUiStore()
</script>

<template>
  <Transition name="toast">
    <div v-if="ui.toast" :key="ui.toast.token" class="toast">{{ ui.toast.text }}</div>
  </Transition>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}
</style>
