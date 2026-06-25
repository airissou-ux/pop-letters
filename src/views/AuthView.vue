<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { sanitizePseudo, isValidPseudo } from '@/lib/sanitize'
import { DEFAULT_EMOJI } from '@/lib/constants'
import BrandLogo from '@/components/BrandLogo.vue'
import EmojiPicker from '@/components/EmojiPicker.vue'

const router = useRouter()
const auth = useAuthStore()

const mode = ref('login')
const email = ref('')
const password = ref('')
const pseudo = ref('')
const emoji = ref(DEFAULT_EMOJI)
const error = ref('')
const submitting = ref(false)
const pseudoStatus = ref({ text: '', cls: '' })

let pseudoTimer = null
watch(pseudo, (val) => {
  if (mode.value !== 'signup') return
  const clean = sanitizePseudo(val)
  if (!isValidPseudo(clean)) {
    pseudoStatus.value = { text: val ? '3 caractères minimum' : '', cls: 'taken' }
    return
  }
  pseudoStatus.value = { text: 'Vérification…', cls: 'checking' }
  clearTimeout(pseudoTimer)
  pseudoTimer = setTimeout(async () => {
    const free = await auth.isPseudoAvailable(clean)
    pseudoStatus.value = free
      ? { text: '✓ Disponible', cls: 'ok' }
      : { text: '❌ Pseudo déjà pris', cls: 'taken' }
  }, 500)
})

function setMode(m) {
  mode.value = m
  error.value = ''
}

async function submit() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Email et mot de passe requis.'
    return
  }
  submitting.value = true
  try {
    if (mode.value === 'signup') {
      await auth.signup({
        email: email.value.trim(),
        password: password.value,
        pseudo: pseudo.value,
        emoji: emoji.value,
      })
    } else {
      await auth.login({ email: email.value.trim(), password: password.value })
    }
    router.replace({ name: 'splash' })
  } catch (err) {
    const m = err.message || ''
    error.value =
      m.includes('Invalid') || m.includes('credentials')
        ? 'Email ou mot de passe incorrect.'
        : m.includes('already registered')
          ? 'Email déjà utilisé.'
          : m.includes('Password')
            ? 'Mot de passe trop court (6 car. min.).'
            : m
  } finally {
    submitting.value = false
  }
}

function skip() {
  auth.continueAsGuest()
  router.replace({ name: 'splash' })
}
</script>

<template>
  <div id="auth" class="screen active">
    <div class="auth-box">
      <BrandLogo variant="auth" />

      <div class="auth-tabs">
        <div class="auth-tab" :class="{ active: mode === 'login' }" @click="setMode('login')">
          Connexion
        </div>
        <div class="auth-tab" :class="{ active: mode === 'signup' }" @click="setMode('signup')">
          Inscription
        </div>
      </div>

      <div class="auth-error" :class="{ show: !!error }">{{ error }}</div>

      <div v-if="mode === 'signup'">
        <div class="auth-field">
          <label>Pseudo</label>
          <input
            v-model="pseudo"
            type="text"
            class="auth-input"
            placeholder="Ton pseudo"
            maxlength="20"
            autocomplete="off"
          />
          <div class="edit-status" :class="pseudoStatus.cls">{{ pseudoStatus.text }}</div>
        </div>
        <div class="auth-field">
          <label>Ton emoji</label>
          <EmojiPicker v-model="emoji" />
          <div class="emoji-hint">Emoji choisi : {{ emoji }}</div>
        </div>
      </div>

      <div class="auth-field">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="ton@email.com" autocomplete="email" />
      </div>
      <div class="auth-field">
        <label>Mot de passe</label>
        <input
          v-model="password"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
          @keyup.enter="submit"
        />
      </div>

      <button class="auth-btn" :disabled="submitting" @click="submit">
        {{ submitting ? '…' : mode === 'login' ? 'SE CONNECTER' : 'CRÉER MON COMPTE' }}
      </button>
      <span class="auth-skip" @click="skip">Jouer sans compte →</span>
    </div>
  </div>
</template>

<style scoped>
.auth-input {
  width: 100%;
  background: var(--surface2);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  font-family: var(--font-ui);
  font-size: 15px;
  color: var(--text);
  outline: none;
}
.emoji-hint {
  font-size: 11px;
  color: var(--dim);
  margin-top: 4px;
}
</style>
