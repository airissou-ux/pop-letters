<script setup>
import { ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { useUiStore } from '@/stores/ui'
import { DIFFICULTY } from '@/lib/constants'
import BrandLogo from '@/components/BrandLogo.vue'
import BottomNav from '@/components/BottomNav.vue'

const game = useGameStore()
const ui = useUiStore()

const selectedDiff = ref(game.diffIdx ?? 0)

function start() {
  game.startSolo(selectedDiff.value)
}
</script>

<template>
  <div id="splash" class="screen active">
    <BrandLogo variant="splash" />
    <div class="splash-tag">BRAIN GAME</div>

    <div class="diff-list">
      <button
        v-for="(d, i) in DIFFICULTY"
        :key="d.label"
        class="diff-btn"
        :class="{ sel: i === selectedDiff }"
        @click="selectedDiff = i"
      >
        <span>{{ d.icon }}</span>
        <span>{{ d.label }}</span>
        <span class="spd">1 carte / {{ d.ms / 1000 }}s</span>
      </button>
    </div>

    <button class="start-btn" @click="start">START 🚀</button>
    <button class="tuto-link-splash" @click="ui.openTutorial(0)">? Règles du jeu</button>

    <BottomNav active="play" class="splash-nav" />
  </div>
</template>

<style scoped>
.splash-nav {
  margin-top: 20px;
  position: relative;
  z-index: 1;
  background: transparent;
  border-top: none;
}
</style>
