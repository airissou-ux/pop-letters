<script setup>
import { computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import { DIFFICULTY, LEGACY_LEVEL_ICONS } from '@/lib/constants'
import ModalShell from './ModalShell.vue'

const ui = useUiStore()

const g = computed(() => ui.selectedGame)
const icon = computed(() => {
  if (!g.value) return '🎮'
  return DIFFICULTY.find((d) => d.label === g.value.level)?.icon || LEGACY_LEVEL_ICONS[g.value.level] || '🎮'
})
const dateLabel = computed(() =>
  g.value
    ? new Date(g.value.created_at).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : '',
)
const modeTag = computed(() => (g.value?.is_daily ? '⭐ POP du jour' : g.value?.level || ''))
const words = computed(() => g.value?.words || [])
const wordCount = computed(() => g.value?.word_count || 0)
</script>

<template>
  <ModalShell id="game-detail">
    <div v-if="g" class="detail-header">
      <div class="detail-mode">{{ modeTag }} · {{ dateLabel }}</div>
      <div class="detail-score">{{ g.score }}</div>
      <div class="detail-meta">
        {{ icon }} {{ g.level || '' }} · {{ wordCount }} mot{{ wordCount > 1 ? 's' : '' }} trouvé{{
          wordCount > 1 ? 's' : ''
        }}
      </div>
    </div>
    <template v-if="g && words.length">
      <div class="detail-words-title">Mots trouvés</div>
      <div class="detail-words">
        <span v-for="w in words" :key="w" class="detail-chip">{{ w }}</span>
      </div>
    </template>
    <div v-else-if="g" class="detail-empty">Aucun mot enregistré pour cette partie</div>
  </ModalShell>
</template>

<style scoped>
.detail-mode {
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--dim);
  margin-bottom: 6px;
}
.detail-words-title {
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--dim);
  margin-bottom: 8px;
  font-weight: 700;
}
.detail-empty {
  text-align: center;
  color: var(--dim);
  font-size: 13px;
  padding: 16px;
}
</style>
