<script setup>
import { useUiStore } from '@/stores/ui'

defineProps({
  id: { type: String, required: true },
  scroll: { type: Boolean, default: false },
})
const ui = useUiStore()

function onOverlayClick(e) {
  if (e.target === e.currentTarget) ui.closeModal()
}
</script>

<template>
  <div v-if="ui.activeModal === id" class="modal-overlay" @click="onOverlayClick">
    <div class="modal-sheet" :class="{ 'modal-sheet--scroll': scroll }">
      <div class="modal-handle"></div>
      <button class="modal-close" @click="ui.closeModal()">✕</button>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.modal-sheet {
  position: relative;
}
.modal-sheet--scroll {
  max-height: 90vh;
  overflow-y: auto;
}
</style>
