<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
const game = useGameStore()

const filled = computed(() => Math.ceil(game.grid.filter((c) => c.revealed).length / 2))
</script>

<template>
  <div class="prog-dots">
    <div v-for="i in 10" :key="i" class="prog-dot" :class="{ on: i - 1 < filled }"></div>
  </div>
</template>
