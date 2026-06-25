<script setup>
import { ref, watch } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useDuelStore } from '@/stores/duel'
import ModalShell from './ModalShell.vue'

const ui = useUiStore()
const duel = useDuelStore()

const view = ref('home') // home | join
const joinCode = ref('')

watch(
  () => ui.activeModal,
  (id) => {
    if (id === 'duel') {
      view.value = 'home'
      joinCode.value = ''
      duel.reset()
    }
  },
)

function shareCode() {
  const text = `Je te défie sur POP LETTERS ! Code : ${duel.code} 🎮`
  if (navigator.share) navigator.share({ title: 'POP LETTERS Duel', text })
  else {
    navigator.clipboard.writeText(text)
    ui.showToast('Code copié !')
  }
}
</script>

<template>
  <ModalShell id="duel">
    <div class="modal-title">⚔️ Mode Duel</div>

    <div v-if="duel.error" class="auth-error show">{{ duel.error }}</div>

    <!-- Accueil -->
    <div v-if="view === 'home' && !duel.code" class="duel-options">
      <div class="duel-option" @click="duel.createDuel()">
        <div class="duel-option-title">⚔️ Créer un duel</div>
        <div class="duel-option-desc">Génère un code à partager avec ton adversaire</div>
      </div>
      <div class="duel-option" @click="view = 'join'">
        <div class="duel-option-title">🎯 Rejoindre un duel</div>
        <div class="duel-option-desc">Entre le code reçu de ton adversaire</div>
      </div>
    </div>

    <!-- Rejoindre -->
    <template v-else-if="view === 'join'">
      <input v-model="joinCode" class="duel-code-input" placeholder="XXXXXX" maxlength="6" />
      <button class="duel-join-btn" @click="duel.joinDuel(joinCode)">REJOINDRE →</button>
    </template>

    <!-- En attente après création -->
    <template v-else-if="duel.code">
      <div class="duel-code-display">
        <div class="duel-code-lbl">TON CODE DUEL</div>
        <div class="duel-code">{{ duel.code }}</div>
        <div class="duel-code-hint">Partage ce code avec ton adversaire</div>
      </div>
      <button class="duel-join-btn" @click="shareCode">📤 Partager le code</button>
      <div v-if="duel.waiting" class="duel-waiting">
        <div class="duel-waiting-icon">⏳</div>
        <div class="duel-waiting-text">En attente de l'adversaire…</div>
      </div>
    </template>
  </ModalShell>
</template>

<style scoped>
.duel-code-lbl {
  font-size: 12px;
  color: var(--dim);
  margin-bottom: 8px;
  letter-spacing: 0.1em;
}
</style>
