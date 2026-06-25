import { defineStore } from 'pinia'
import { ref } from 'vue'

export const TUTO_STEPS = 8

/** État UI transverse : toasts, badge de bonus, modales, tutoriel. */
export const useUiStore = defineStore('ui', () => {
  // Toast — `token` force le re-déclenchement même si le texte est identique.
  const toast = ref(null) // { text, token }
  let toastTimer = null
  let toastSeq = 0
  function showToast(text) {
    toast.value = { text, token: ++toastSeq }
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toast.value = null
    }, 1800)
  }

  // Badge de figure (Quarte / Quinte…).
  const bonus = ref(null) // { text, token }
  let bonusTimer = null
  let bonusSeq = 0
  function showBonus(text) {
    bonus.value = { text, token: ++bonusSeq }
    if (bonusTimer) clearTimeout(bonusTimer)
    bonusTimer = setTimeout(() => {
      bonus.value = null
    }, 2500)
  }

  // Modales : une seule ouverte à la fois.
  const activeModal = ref(null)
  function openModal(id) {
    activeModal.value = id
  }
  function closeModal() {
    activeModal.value = null
  }

  // Partie sélectionnée pour la modale de détail.
  const selectedGame = ref(null)
  function openGameDetail(game) {
    selectedGame.value = game
    activeModal.value = 'game-detail'
  }

  // Tutoriel.
  const tutorialVisible = ref(false)
  const tutorialStep = ref(0)
  function openTutorial(step = 0) {
    tutorialStep.value = step
    tutorialVisible.value = true
  }
  function nextTutorial() {
    if (tutorialStep.value < TUTO_STEPS - 1) tutorialStep.value++
    else closeTutorial()
  }
  function closeTutorial() {
    tutorialVisible.value = false
    localStorage.setItem('fw_tuto_seen', '1')
  }
  function maybeShowTutorial() {
    if (!localStorage.getItem('fw_tuto_seen')) openTutorial(0)
  }

  return {
    toast,
    showToast,
    bonus,
    showBonus,
    activeModal,
    openModal,
    closeModal,
    selectedGame,
    openGameDetail,
    tutorialVisible,
    tutorialStep,
    openTutorial,
    nextTutorial,
    closeTutorial,
    maybeShowTutorial,
  }
})
