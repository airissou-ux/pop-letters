<script setup>
import { useGameStore } from '@/stores/game'
import { TAB_LABELS } from '@/lib/constants'
const game = useGameStore()
</script>

<template>
  <div class="word-panel">
    <div class="word-tabs">
      <div
        v-for="(label, i) in TAB_LABELS"
        :key="i"
        class="word-tab"
        :class="{ active: i === game.activeTab }"
        @click="game.activeTab = i"
      >
        {{ label }}
        <span v-if="game.wordsByLength[i].length" class="tab-count">{{
          game.wordsByLength[i].length
        }}</span>
      </div>
    </div>
    <div class="word-list">
      <span v-if="!game.wordsByLength[game.activeTab].length" class="word-empty">— aucun mot —</span>
      <div v-for="w in game.wordsByLength[game.activeTab]" v-else :key="w" class="word-chip">
        {{ w }}
      </div>
    </div>
  </div>
</template>
