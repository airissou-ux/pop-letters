<script setup>
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'

defineProps({
  active: { type: String, default: 'play' }, // play | daily | duel | share | profile
})
const emit = defineEmits(['play'])

const ui = useUiStore()
const auth = useAuthStore()
</script>

<template>
  <div class="bottom-nav">
    <button class="nav-btn" :class="{ active: active === 'play' }" @click="emit('play')">
      <span class="nav-icon">🎮</span><span class="nav-lbl">Jouer</span>
    </button>
    <button class="nav-btn" :class="{ active: active === 'daily' }" @click="ui.openModal('daily')">
      <span class="nav-icon">⭐</span><span class="nav-lbl">Du jour</span>
    </button>
    <button class="nav-btn" :class="{ active: active === 'duel' }" @click="ui.openModal('duel')">
      <span class="nav-icon">⚔️</span><span class="nav-lbl">Duel</span>
    </button>
    <button class="nav-btn" :class="{ active: active === 'share' }" @click="ui.openModal('share')">
      <span class="nav-icon">📤</span><span class="nav-lbl">Partager</span>
    </button>
    <button class="nav-btn" :class="{ active: active === 'profile' }" @click="ui.openModal('profile')">
      <div class="nav-profile-content">
        <span class="nav-icon">{{ auth.displayEmoji }}</span>
        <span class="nav-profile-pseudo">{{ auth.displayPseudo }}</span>
      </div>
    </button>
  </div>
</template>
