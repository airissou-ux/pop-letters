<script setup>
// Logo « POP LETTERS » décliné selon l'emplacement.
defineProps({
  variant: { type: String, default: 'splash' }, // splash | header | mini | auth | share | tuto
})

const P1 = 'linear-gradient(135deg,#FF4757,#FF6B9D)'
const O = 'linear-gradient(135deg,#FFB703,#FF8C00)'
const P2 = 'linear-gradient(135deg,#06D6A0,#00B4D8)'
</script>

<template>
  <!-- Splash -->
  <div v-if="variant === 'splash'" class="splash-logo-wrap">
    <div class="splash-logo-cards">
      <div class="logo-card" :style="{ background: P1 }">P</div>
      <div class="logo-card" :style="{ background: O }">O</div>
      <div class="logo-card" :style="{ background: P2 }">P</div>
    </div>
    <div class="splash-logo-sub">LETTERS</div>
  </div>

  <!-- En-tête de jeu -->
  <div v-else-if="variant === 'header'" class="hd-logo">
    <div class="hd-logo-cards">
      <span :style="{ background: P1 }">P</span>
      <span :style="{ background: O }">O</span>
      <span :style="{ background: P2 }">P</span>
    </div>
    <span class="hd-logo-letters">LETTERS</span>
  </div>

  <!-- Mini (chargement) -->
  <div v-else-if="variant === 'mini'" class="load-logo-mini">
    <span :style="{ background: P1 }">P</span>
    <span :style="{ background: O }">O</span>
    <span :style="{ background: P2 }">P</span>
  </div>

  <!-- Auth -->
  <div v-else-if="variant === 'auth'" class="auth-logo">
    <div class="brand-row">
      <span class="brand-letter tilt-left" :style="{ background: P1 }">P</span>
      <span class="brand-letter" :style="{ background: O }">O</span>
      <span class="brand-letter tilt-right" :style="{ background: P2 }">P</span>
    </div>
    <div class="brand-letters-word">LETTERS</div>
  </div>

  <!-- Tutoriel -->
  <div v-else-if="variant === 'tuto'" class="brand-tuto">
    <div class="brand-row">
      <span class="brand-letter tilt-left" :style="{ background: P1 }">P</span>
      <span class="brand-letter" :style="{ background: O }">O</span>
      <span class="brand-letter tilt-right" :style="{ background: P2 }">P</span>
    </div>
    <div class="brand-letters-word brand-letters-word--light">LETTERS</div>
  </div>

  <!-- Partage (mini) -->
  <div v-else-if="variant === 'share'" class="brand-row brand-row--share">
    <span class="brand-letter brand-letter--sm tilt-left-sm" :style="{ background: P1 }">P</span>
    <span class="brand-letter brand-letter--sm" :style="{ background: O }">O</span>
    <span class="brand-letter brand-letter--sm tilt-right-sm" :style="{ background: P2 }">P</span>
  </div>
</template>

<style scoped>
/* Styles propres au logo (les variantes splash/header/mini réutilisent style.css). */
.brand-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 4px;
  margin-bottom: 14px;
}
.brand-row--share {
  gap: 5px;
  margin-bottom: 10px;
}
.brand-letter {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-title);
  font-weight: 900;
  font-size: 20px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.brand-letter--sm {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  font-size: 12px;
  box-shadow: none;
}
.tilt-left {
  transform: translateY(12px) rotate(-22deg);
}
.tilt-right {
  transform: translateY(12px) rotate(22deg);
}
.tilt-left-sm {
  transform: translateY(4px) rotate(-22deg);
}
.tilt-right-sm {
  transform: translateY(4px) rotate(22deg);
}
.brand-letters-word {
  font-family: var(--font-title);
  font-weight: 900;
  font-size: 16px;
  letter-spacing: 0.4em;
  text-align: center;
  padding-left: 0.4em;
  background: linear-gradient(90deg, #ff4757, #ffb703, #06d6a0);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 20px;
}
.brand-letters-word--light {
  background: none;
  -webkit-text-fill-color: #fff;
  color: #fff;
  letter-spacing: 0.22em;
  margin-bottom: 0;
}
.brand-tuto {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 12px;
}
</style>
