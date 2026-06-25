<script setup>
import { computed, watch } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useDailyStore } from '@/stores/daily'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'
import ModalShell from './ModalShell.vue'

const ui = useUiStore()
const daily = useDailyStore()
const game = useGameStore()
const auth = useAuthStore()

const MEDALS = ['🥇', '🥈', '🥉']

const dateLabel = computed(() =>
  new Date()
    .toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    .toUpperCase(),
)
const podium = computed(() => daily.leaderboard.slice(0, 3))
const rest = computed(() => daily.leaderboard.slice(3))

function isMe(row) {
  return auth.user && row.user_id === auth.user.id
}

watch(
  () => ui.activeModal,
  (id) => {
    if (id === 'daily') daily.load()
  },
)

function play() {
  ui.closeModal()
  game.startDaily()
}
</script>

<template>
  <ModalShell id="daily">
    <div class="daily-header">
      <div class="daily-date">{{ dateLabel }}</div>
      <div class="daily-title">⭐ POP du jour</div>
      <div class="daily-desc">
        Un tirage unique pour tous.<br />Une seule tentative — fais le meilleur score !
      </div>
    </div>

    <div v-if="daily.loading" class="daily-loading">Chargement…</div>

    <template v-else>
      <div v-if="daily.alreadyPlayed" class="daily-played">
        Ton score aujourd'hui : <strong>{{ daily.myScore }} pts</strong><br />
        <span class="daily-played-sub">Reviens demain pour un nouveau tirage !</span>
      </div>
      <button v-else class="daily-start-btn" @click="play">🚀 JOUER LE POP DU JOUR</button>

      <div v-if="daily.leaderboard.length" class="daily-scores">
        <div class="daily-scores-title">
          🏆 Classement du jour — {{ daily.leaderboard.length }} joueur{{
            daily.leaderboard.length > 1 ? 's' : ''
          }}
        </div>

        <div class="lb-podium">
          <div
            v-for="(s, i) in podium"
            :key="s.user_id"
            class="lb-podium-item"
            :class="[['gold', 'silver', 'bronze'][i], { 'lb-podium-me': isMe(s) }]"
          >
            <div class="lb-podium-medal">{{ MEDALS[i] }}</div>
            <div class="lb-podium-emoji">{{ s.emoji }}</div>
            <div class="lb-podium-pseudo">{{ s.pseudo }}{{ isMe(s) ? ' ✓' : '' }}</div>
            <div class="lb-podium-score">{{ s.score }}</div>
          </div>
        </div>

        <div v-if="rest.length" class="daily-lb-wrap">
          <div
            v-for="(s, i) in rest"
            :key="s.user_id"
            class="leaderboard-item"
            :class="{ 'lb-me': isMe(s) }"
          >
            <div class="lb-rank">{{ i + 4 }}</div>
            <div class="lb-emoji">{{ s.emoji }}</div>
            <div class="lb-pseudo">{{ s.pseudo }}{{ isMe(s) ? ' ✓' : '' }}</div>
            <div class="lb-score">{{ s.score }}</div>
          </div>
        </div>
      </div>
      <div v-else class="daily-empty">Sois le premier à jouer aujourd'hui !</div>
    </template>
  </ModalShell>
</template>

<style scoped>
.daily-loading,
.daily-empty {
  text-align: center;
  color: var(--dim);
  font-size: 13px;
  padding: 18px;
}
.daily-played-sub {
  font-size: 12px;
  margin-top: 4px;
  display: block;
}
</style>
