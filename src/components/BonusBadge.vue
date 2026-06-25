<script setup>
import { useUiStore } from '@/stores/ui'
const ui = useUiStore()
</script>

<template>
  <div v-if="ui.bonus" :key="ui.bonus.token" class="bonus-badge">{{ ui.bonus.text }}</div>
</template>
