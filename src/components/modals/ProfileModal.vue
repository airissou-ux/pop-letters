<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import { sanitizePseudo, isValidPseudo } from '@/lib/sanitize'
import { DIFFICULTY, LEGACY_LEVEL_ICONS } from '@/lib/constants'
import EmojiPicker from '@/components/EmojiPicker.vue'
import ModalShell from './ModalShell.vue'

const router = useRouter()
const ui = useUiStore()
const auth = useAuthStore()

const games = ref([])
const editPseudoOpen = ref(false)
const editEmojiOpen = ref(false)
const deleteOpen = ref(false)
const pseudoInput = ref('')
const pseudoStatus = ref({ text: '', cls: '' })
const pseudoSaveDisabled = ref(true)
const editEmoji = ref('')

const stats = computed(() => {
  const total = games.value.length
  const best = total ? Math.max(0, ...games.value.map((g) => g.score)) : 0
  const avg = total ? Math.round(games.value.reduce((s, g) => s + g.score, 0) / total) : 0
  const words = games.value.reduce((s, g) => s + (g.word_count || 0), 0)
  return { total, best, avg, words }
})
const history = computed(() => games.value.slice(0, 20))

function iconFor(level) {
  return DIFFICULTY.find((d) => d.label === level)?.icon || LEGACY_LEVEL_ICONS[level] || '🎮'
}
function dateFor(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

async function load() {
  editPseudoOpen.value = false
  editEmojiOpen.value = false
  deleteOpen.value = false
  if (!auth.isAuthenticated) {
    games.value = []
    return
  }
  await auth.loadProfile()
  editEmoji.value = auth.profile?.emoji || '🎯'
  const { data } = await supabase
    .from('games')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('score', { ascending: false })
    .limit(50)
  games.value = data || []
}

watch(
  () => ui.activeModal,
  (id) => {
    if (id === 'profile') load()
  },
)

// Édition pseudo avec vérification de disponibilité.
let pseudoTimer = null
watch(pseudoInput, (val) => {
  const clean = sanitizePseudo(val)
  pseudoSaveDisabled.value = true
  if (!isValidPseudo(clean)) {
    pseudoStatus.value = { text: val ? '3 caractères minimum' : '', cls: 'taken' }
    return
  }
  if (clean === auth.profile?.pseudo) {
    pseudoStatus.value = { text: 'Pseudo actuel', cls: 'ok' }
    return
  }
  pseudoStatus.value = { text: 'Vérification…', cls: 'checking' }
  clearTimeout(pseudoTimer)
  pseudoTimer = setTimeout(async () => {
    const free = await auth.isPseudoAvailable(clean)
    pseudoStatus.value = free
      ? { text: '✓ Disponible', cls: 'ok' }
      : { text: '❌ Pseudo déjà pris', cls: 'taken' }
    pseudoSaveDisabled.value = !free
  }, 500)
})

async function savePseudo() {
  try {
    await auth.updatePseudo(pseudoInput.value)
    editPseudoOpen.value = false
    ui.showToast('Pseudo mis à jour !')
  } catch (e) {
    ui.showToast('Erreur: ' + e.message)
  }
}

async function saveEmoji() {
  try {
    await auth.updateEmoji(editEmoji.value)
    editEmojiOpen.value = false
    ui.showToast('Emoji mis à jour !')
  } catch (e) {
    ui.showToast('Erreur: ' + e.message)
  }
}

async function confirmDelete() {
  try {
    await auth.deleteAccount()
    ui.closeModal()
    ui.showToast('Compte supprimé.')
    router.replace({ name: 'auth' })
  } catch (e) {
    ui.showToast('Erreur: ' + e.message)
  }
}

async function logout() {
  await auth.logout()
  ui.closeModal()
  router.replace({ name: 'auth' })
}

function goToAuth() {
  ui.closeModal()
  router.replace({ name: 'auth' })
}
</script>

<template>
  <ModalShell id="profile" scroll>
    <!-- Non connecté -->
    <template v-if="!auth.isAuthenticated">
      <div class="profile-hero">
        <div class="profile-hero-emoji">👤</div>
        <div class="profile-hero-info"><div class="profile-hero-pseudo">Non connecté</div></div>
      </div>
      <div class="profile-guest">
        <button class="auth-btn" @click="goToAuth">Se connecter</button>
      </div>
    </template>

    <!-- Connecté -->
    <template v-else>
      <div class="profile-hero">
        <div class="profile-hero-emoji">{{ auth.profile?.emoji || '🎯' }}</div>
        <div class="profile-hero-info">
          <div class="profile-hero-pseudo">{{ auth.profile?.pseudo || '✏️ Choisir un pseudo' }}</div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card"><div class="stat-val">{{ stats.total }}</div><div class="stat-lbl">Parties</div></div>
        <div class="stat-card"><div class="stat-val">{{ stats.best }}</div><div class="stat-lbl">Meilleur score</div></div>
        <div class="stat-card"><div class="stat-val">{{ stats.avg }}</div><div class="stat-lbl">Score moyen</div></div>
        <div class="stat-card"><div class="stat-val">{{ stats.words }}</div><div class="stat-lbl">Mots trouvés</div></div>
      </div>

      <div class="profile-section-title">Meilleures parties</div>
      <div class="history-list">
        <div v-if="!history.length" class="history-empty">Aucune partie</div>
        <div
          v-for="g in history"
          :key="g.id"
          class="history-item"
          @click="ui.openGameDetail(g)"
        >
          <div class="history-left">
            <div class="history-score">{{ g.score }} pts</div>
            <div class="history-meta">
              {{ g.word_count || 0 }} mot{{ (g.word_count || 0) > 1 ? 's' : '' }} · {{ g.level || '' }}
            </div>
          </div>
          <div class="history-right">
            <div class="history-level">{{ iconFor(g.level) }}</div>
            <div class="history-date">{{ dateFor(g.created_at) }}</div>
            <div class="history-see">voir →</div>
          </div>
        </div>
      </div>

      <div class="profile-section-title">Modifier mon profil</div>
      <button class="profile-action-btn" @click="editPseudoOpen = !editPseudoOpen">
        ✏️ Changer mon pseudo
      </button>
      <div v-show="editPseudoOpen" class="profile-edit-box show">
        <div class="edit-row">
          <input v-model="pseudoInput" class="edit-input" :class="pseudoStatus.cls" placeholder="Nouveau pseudo" maxlength="20" />
          <button class="edit-save" :disabled="pseudoSaveDisabled" @click="savePseudo">OK</button>
        </div>
        <div class="edit-status" :class="pseudoStatus.cls">{{ pseudoStatus.text }}</div>
      </div>

      <button class="profile-action-btn" @click="editEmojiOpen = !editEmojiOpen">
        😊 Changer mon emoji
      </button>
      <div v-show="editEmojiOpen" class="profile-edit-box show">
        <EmojiPicker v-model="editEmoji" />
        <button
          class="edit-save edit-save--full"
          :disabled="editEmoji === auth.profile?.emoji"
          @click="saveEmoji"
        >
          Enregistrer
        </button>
      </div>

      <div class="profile-section-title profile-section-title--danger">Zone dangereuse</div>
      <button class="profile-action-btn danger" @click="deleteOpen = !deleteOpen">
        🗑️ Supprimer mon compte
      </button>
      <div v-show="deleteOpen" class="delete-confirm show">
        <p>
          Cette action est <strong>irréversible</strong>. Toutes tes parties et ton profil seront
          supprimés définitivement.
        </p>
        <div class="delete-confirm-btns">
          <button class="btn-delete-cancel" @click="deleteOpen = false">Annuler</button>
          <button class="btn-delete-confirm" @click="confirmDelete">Supprimer</button>
        </div>
      </div>

      <button class="logout-btn" @click="logout">Se déconnecter</button>
    </template>
  </ModalShell>
</template>

<style scoped>
.profile-guest {
  text-align: center;
  padding: 20px;
}
.history-empty {
  text-align: center;
  color: var(--dim);
  font-size: 13px;
  padding: 16px;
}
.history-item {
  cursor: pointer;
}
.history-see {
  font-size: 9px;
  color: var(--dim);
  margin-top: 2px;
}
.profile-section-title--danger {
  color: rgba(255, 71, 87, 0.6);
}
.edit-save--full {
  width: 100%;
  margin-top: 10px;
}
.logout-btn {
  margin-top: 16px;
}
</style>
