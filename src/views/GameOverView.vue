<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { computeFinalScore } from '@/lib/scoring'
import { DIFFICULTY } from '@/lib/constants'
import BottomNav from '@/components/BottomNav.vue'

const router = useRouter()
const game = useGameStore()

const breakdown = computed(() => computeFinalScore(game.wordList))
const level = computed(() => DIFFICULTY[game.diffIdx])
const title = computed(() => (game.gameOverReason === 'mistakes' ? '3 FAUTES !' : 'GRILLE PLEINE'))

function replay() {
  game.startSolo(game.diffIdx)
}
function backToSplash() {
  router.replace({ name: 'splash' })
}

onMounted(() => {
  if (!game.lastResult) router.replace({ name: 'splash' })
})
</script>

<template>
  <div id="gameover" class="screen active">
    <div class="go-title">{{ title }}</div>
    <div class="go-sub">score final</div>
    <div class="go-score">{{ breakdown.total }}</div>
    <div class="go-level">{{ level.icon }} {{ level.label }}</div>

    <div class="go-grid">
      <div
        v-for="cell in game.grid"
        :key="cell.id"
        class="go-card"
        :class="cell.revealed && cell.letter ? 'filled' : 'empty'"
      >
        {{ cell.revealed && cell.letter ? cell.letter : '' }}
      </div>
    </div>

    <div class="go-words">
      <div class="go-words-title">
        {{ game.wordList.length }} mot{{ game.wordList.length !== 1 ? 's' : '' }} trouvé{{
          game.wordList.length !== 1 ? 's' : ''
        }}
      </div>
      <div class="go-words-list">
        <span v-if="!game.wordList.length" class="go-words-empty">Aucun mot validé</span>
        <div v-for="w in game.wordList" v-else :key="w" class="go-chip">{{ w }}</div>
      </div>
    </div>

    <div class="go-bonus">
      <div class="go-row"><span>Lettres collectées</span><span class="go-val">{{ breakdown.base }} pts</span></div>
      <div class="go-row"><span>Bonus longueur</span><span class="go-val">+{{ breakdown.len }} pts</span></div>
      <div v-if="breakdown.qf > 0" class="go-row">
        <span>Quinte Flush ×{{ breakdown.qf }}</span><span class="go-val">+{{ breakdown.qf * 75 }} pts</span>
      </div>
      <div v-if="breakdown.q > 0" class="go-row">
        <span>Quinte ×{{ breakdown.q }}</span><span class="go-val">+{{ breakdown.q * 50 }} pts</span>
      </div>
      <div v-if="breakdown.qa > 0" class="go-row">
        <span>Quarte ×{{ breakdown.qa }}</span><span class="go-val">+{{ breakdown.qa * 25 }} pts</span>
      </div>
      <div class="go-row go-row--total">
        <span class="go-total-lbl">TOTAL</span>
        <span class="go-val go-total-val">{{ breakdown.total }} pts</span>
      </div>
    </div>

    <button class="go-replay" @click="replay">REJOUER 🔥</button>
    <button class="btn-back" @click="backToSplash">← Changer de niveau</button>

    <BottomNav active="play" class="go-nav" @play="replay" />
  </div>
</template>

<style scoped>
.go-words-empty {
  color: var(--dim);
  font-size: 12px;
}
.go-row--total {
  border-bottom: none;
  border-top: 1px solid var(--border);
  padding-top: 8px;
  margin-top: 4px;
}
.go-total-lbl {
  font-weight: 700;
  color: var(--text);
}
.go-total-val {
  font-size: 18px;
}
.go-nav {
  margin-top: 16px;
}
</style>
