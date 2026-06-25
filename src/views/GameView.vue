<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useUiStore } from '@/stores/ui'
import { checkWord } from '@/lib/dictionary'
import { wordFromSelection } from '@/lib/grid'
import BrandLogo from '@/components/BrandLogo.vue'
import BottomNav from '@/components/BottomNav.vue'
import MistakeDots from '@/components/game/MistakeDots.vue'
import WordPanel from '@/components/game/WordPanel.vue'
import GameGrid from '@/components/game/GameGrid.vue'
import ProgressDots from '@/components/game/ProgressDots.vue'

const router = useRouter()
const game = useGameStore()
const ui = useUiStore()

const shake = ref(false)

const currentWord = computed(() => wordFromSelection(game.grid, game.selection))
const isValid = computed(() => game.selection.length >= 5 && checkWord(currentWord.value))
const firstValid = computed(
  () => game.selection.length >= 5 && game.grid[game.selection[0]]?.valid,
)

// Mot absent / déjà joué → secousse du champ de saisie.
watch(
  () => game.shakeToken,
  () => {
    shake.value = true
    setTimeout(() => (shake.value = false), 400)
  },
)

onMounted(() => {
  // Accès direct / rechargement sans partie en cours → retour au splash.
  if (!game.grid.length) router.replace({ name: 'splash' })
})
onUnmounted(() => game.stop())
</script>

<template>
  <div id="game" class="screen active">
    <div class="game-header">
      <BrandLogo variant="header" />
      <MistakeDots />
      <div class="hd-score">
        <div class="score-lbl">Score</div>
        <div class="score-val">{{ game.score }}</div>
      </div>
    </div>

    <WordPanel />
    <GameGrid />

    <div class="input-area">
      <div
        class="word-display"
        :class="{ typing: currentWord && !firstValid, valid: firstValid, shake }"
      >
        <span v-if="!currentWord" class="word-placeholder">Sélectionnez des lettres…</span>
        <template v-else>{{ currentWord }}</template>
      </div>
      <div class="input-actions">
        <button class="btn-clear" @click="game.clearSelection()">✕</button>
        <button
          class="btn-validate"
          :class="{ active: isValid }"
          :disabled="!isValid"
          @click="game.validate()"
        >
          {{ isValid ? '✓ VALIDER' : 'VALIDER' }}
        </button>
      </div>
    </div>

    <div class="bottom-bar-info">
      <div class="phase-label">
        <span>{{ game.currentPhase.icon }}</span><span>{{ game.currentPhase.label }}</span>
      </div>
      <ProgressDots />
      <button class="btn-help" @click="ui.openTutorial(0)">?</button>
    </div>

    <BottomNav active="play" />
  </div>
</template>

<style scoped>
.bottom-bar-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  border-top: 1px solid var(--border);
  margin-top: 2px;
}
.phase-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--dim);
  font-weight: 600;
}
</style>
