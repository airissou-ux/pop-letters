<script setup>
import { useGameStore } from '@/stores/game'
const game = useGameStore()
</script>

<template>
  <div class="grid-wrap">
    <div
      v-for="cell in game.grid"
      :key="cell.id"
      class="card"
      :class="{ revealed: cell.revealed, selected: cell.selected, valid: cell.valid, gone: cell.gone }"
      @click="game.handleCellClick(cell.id)"
    >
      <div class="card-inner">
        <div class="card-back"></div>
        <div class="card-face">{{ cell.letter || '' }}</div>
      </div>
    </div>
  </div>
</template>
