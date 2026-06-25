<script setup>
import { EMOJI_CATEGORIES } from '@/lib/constants'

defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="emoji-picker">
    <template v-for="(emojis, cat) in EMOJI_CATEGORIES" :key="cat">
      <div class="emoji-cat-title">{{ cat }}</div>
      <div class="emoji-cat-grid">
        <div
          v-for="e in emojis"
          :key="e"
          class="emoji-opt"
          :class="{ sel: e === modelValue }"
          @click="emit('update:modelValue', e)"
        >
          {{ e }}
        </div>
      </div>
    </template>
  </div>
</template>
