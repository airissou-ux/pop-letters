<script setup>
import BrandLogo from './BrandLogo.vue'

defineProps({
  progress: { type: Number, default: 0 },
  message: { type: String, default: 'Chargement du dictionnaire…' },
})
</script>

<template>
  <div id="loading">
    <BrandLogo variant="mini" />
    <div class="load-sub">LETTERS</div>
    <div class="load-bar-wrap"><div class="load-bar" :style="{ width: progress + '%' }"></div></div>
    <div class="load-msg">{{ message }}</div>
  </div>
</template>
