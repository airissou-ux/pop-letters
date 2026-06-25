<script setup>
import { computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useGameStore } from '@/stores/game'
import { DIFFICULTY } from '@/lib/constants'
import BrandLogo from '@/components/BrandLogo.vue'
import ModalShell from './ModalShell.vue'

const APP_URL = 'https://airissou-ux.github.io/pop-letters/'

const ui = useUiStore()
const game = useGameStore()

const score = computed(() => game.lastResult?.score ?? game.score ?? 0)
const level = computed(() => game.lastResult?.level || DIFFICULTY[game.diffIdx]?.label || '')
const words = computed(() => game.lastResult?.wordCount ?? game.wordList?.length ?? 0)
const icon = computed(() => DIFFICULTY.find((d) => d.label === level.value)?.icon || '🌙')
const dateStr = computed(() =>
  new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
)
const modeTag = computed(() =>
  game.isDaily ? '⭐ POP du jour' : game.isDuel ? '⚔️ Duel' : level.value,
)

const shareText = computed(
  () =>
    `🎮 POP LETTERS ${game.isDaily ? '(POP du jour)' : ''}\n${score.value} pts · ${words.value} mots · ${icon.value} ${level.value}\n${dateStr.value}\n\n👉 ${APP_URL}`,
)

function shareNative() {
  if (navigator.share) navigator.share({ title: 'POP LETTERS', text: shareText.value, url: APP_URL })
  else copy()
}
function openWhatsApp() {
  window.open('https://wa.me/?text=' + encodeURIComponent(shareText.value), '_blank')
}
function openX() {
  window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText.value), '_blank')
}
function copy() {
  navigator.clipboard.writeText(shareText.value)
  ui.showToast('Copié !')
}
</script>

<template>
  <ModalShell id="share">
    <div class="modal-title">Partager</div>
    <div class="share-preview">
      <BrandLogo variant="share" />
      <div class="share-preview-mode">{{ modeTag }} · {{ dateStr }}</div>
      <div class="share-preview-score">{{ score }}</div>
      <div class="share-preview-meta">
        pts · {{ words }} mot{{ words > 1 ? 's' : '' }} · {{ icon }} {{ level }}
      </div>
    </div>
    <div class="share-btns">
      <button class="share-btn" @click="shareNative">
        <span class="share-btn-icon">📤</span>Partager via…
      </button>
      <button class="share-btn" @click="openWhatsApp">
        <span class="share-btn-icon">💬</span>WhatsApp
      </button>
      <button class="share-btn" @click="openX"><span class="share-btn-icon">𝕏</span>X / Twitter</button>
      <button class="share-btn" @click="copy"><span class="share-btn-icon">📋</span>Copier</button>
    </div>
  </ModalShell>
</template>

<style scoped>
.share-preview-mode {
  font-size: 10px;
  letter-spacing: 0.25em;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 8px;
}
.share-preview-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}
</style>
