<script setup>
import { useGameStore } from '@/stores/game'
import { MAX_MISTAKES } from '@/lib/constants'
const game = useGameStore()
</script>

<template>
  <div class="hd-mistakes">
    <div
      v-for="i in MAX_MISTAKES"
      :key="i"
      class="dot"
      :class="{ used: i - 1 < game.mistakes }"
    ></div>
  </div>
</template>
