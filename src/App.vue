<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { loadDictionary } from '@/lib/dictionary'
import LoadingScreen from '@/components/LoadingScreen.vue'
import ToastHost from '@/components/ToastHost.vue'
import BonusBadge from '@/components/BonusBadge.vue'
import TutorialOverlay from '@/components/TutorialOverlay.vue'
import ProfileModal from '@/components/modals/ProfileModal.vue'
import DailyModal from '@/components/modals/DailyModal.vue'
import DuelModal from '@/components/modals/DuelModal.vue'
import GameDetailModal from '@/components/modals/GameDetailModal.vue'
import ShareModal from '@/components/modals/ShareModal.vue'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const booting = ref(true)
const progress = ref(0)
const message = ref('Chargement du dictionnaire…')

onMounted(async () => {
  try {
    await auth.bootstrap()
    await loadDictionary((p, msg) => {
      progress.value = p
      message.value = msg
    })
  } finally {
    booting.value = false
    // Connecté → splash ; sinon écran d'authentification.
    router.replace(auth.isAuthenticated ? { name: 'splash' } : { name: 'auth' })
    // Premier passage : afficher le tutoriel.
    ui.maybeShowTutorial()
  }
})
</script>

<template>
  <LoadingScreen v-if="booting" :progress="progress" :message="message" />
  <template v-else>
    <router-view />
    <TutorialOverlay />
    <ProfileModal />
    <DailyModal />
    <DuelModal />
    <GameDetailModal />
    <ShareModal />
    <ToastHost />
    <BonusBadge />
  </template>
</template>
