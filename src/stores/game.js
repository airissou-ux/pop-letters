import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '@/router'
import { useAuthStore } from './auth'
import { useUiStore } from './ui'
import { useDuelStore } from './duel'
import { supabase } from '@/lib/supabase'
import { checkWord } from '@/lib/dictionary'
import { shuffle, seededShuffle, getDailySeed } from '@/lib/seed'
import { emptyCell, drawLetter, wordFromSelection, tabForLength } from '@/lib/grid'
import { calcBonus, computeFinalScore } from '@/lib/scoring'
import {
  DIFFICULTY,
  DAILY_PHASES,
  LETTER_POOL,
  GRID_SIZE,
  INITIAL_REVEALED,
  MAX_MISTAKES,
} from '@/lib/constants'

const GONE_ANIM_MS = 350

/** Moteur de jeu : grille, sélection, score, boucle de révélation, fin de partie. */
export const useGameStore = defineStore('game', () => {
  const grid = ref([])
  const selection = ref([])
  const wordList = ref([])
  const score = ref(0)
  const mistakes = ref(0)
  const activeTab = ref(0)
  const diffIdx = ref(0)
  const mode = ref('solo') // 'solo' | 'daily' | 'duel'
  const gameOverReason = ref(null)
  const lastResult = ref(null) // { score, level, wordCount }
  const shakeToken = ref(0) // incrémenté pour déclencher l'animation "shake"

  // Non réactif : deck et identifiants de timers.
  let deck = []
  let intervalId = null
  let lastCardTimer = null
  let active = false

  const isDaily = computed(() => mode.value === 'daily')
  const isDuel = computed(() => mode.value === 'duel')

  /** Phase courante (icône + label) affichée dans la barre du bas. */
  const currentPhase = computed(() => {
    if (mode.value === 'daily') return DAILY_PHASES.find((p) => score.value >= p.min)
    return DIFFICULTY[diffIdx.value]
  })

  /** Mots regroupés par longueur, pour les onglets (index 0..5 = 5L..10+L). */
  const wordsByLength = computed(() =>
    [5, 6, 7, 8, 9, 10].map((l) =>
      wordList.value.filter((w) => (l === 10 ? w.length >= 10 : w.length === l)),
    ),
  )

  function effectiveMs() {
    if (mode.value === 'daily') return DAILY_PHASES.find((p) => score.value >= p.min).ms
    return DIFFICULTY[diffIdx.value].ms
  }

  function clearTimers() {
    if (intervalId) clearTimeout(intervalId)
    if (lastCardTimer) clearTimeout(lastCardTimer)
    intervalId = null
    lastCardTimer = null
  }

  function scheduleNext() {
    intervalId = setTimeout(tick, effectiveMs())
  }

  function tick() {
    if (!active || !grid.value.length) return
    const hidden = grid.value.map((c, i) => (!c.revealed ? i : -1)).filter((i) => i >= 0)
    if (hidden.length === 0) return
    const idx = hidden[Math.floor(Math.random() * hidden.length)]
    grid.value[idx].letter = drawLetter(deck)
    grid.value[idx].revealed = true

    if (grid.value.every((c) => c.revealed)) {
      // Dernière carte : laisser un délai annulable avant la fin.
      lastCardTimer = setTimeout(() => {
        if (grid.value.every((c) => c.revealed || c.gone)) {
          gameOver('grid_full')
        } else {
          lastCardTimer = null
          scheduleNext()
        }
      }, effectiveMs())
      return
    }
    scheduleNext()
  }

  /**
   * Démarre une partie.
   * @param {object} opts
   * @param {'solo'|'daily'|'duel'} opts.mode
   * @param {string[]} [opts.deck] - deck imposé (daily/duel) ; sinon mélange aléatoire.
   * @param {number} [opts.diffIdx] - difficulté (mode solo).
   */
  function startGame({ mode: gameMode = 'solo', deck: forcedDeck, diffIdx: forcedDiff } = {}) {
    clearTimers()
    mode.value = gameMode
    if (typeof forcedDiff === 'number') diffIdx.value = forcedDiff
    if (gameMode === 'daily') diffIdx.value = 0

    deck = forcedDeck && forcedDeck.length ? [...forcedDeck] : shuffle([...LETTER_POOL])

    grid.value = Array.from({ length: GRID_SIZE }, (_, i) => emptyCell(i))
    selection.value = []
    wordList.value = []
    score.value = 0
    mistakes.value = 0
    activeTab.value = 0
    gameOverReason.value = null

    const order = shuffle([...Array(GRID_SIZE).keys()])
    order.slice(0, INITIAL_REVEALED).forEach((i) => {
      grid.value[i].letter = drawLetter(deck)
      grid.value[i].revealed = true
    })

    active = true
    router.push({ name: 'game' })
    scheduleNext()
  }

  function startSolo(diff) {
    startGame({ mode: 'solo', diffIdx: diff })
  }

  function startDaily() {
    startGame({ mode: 'daily', deck: seededShuffle([...LETTER_POOL], getDailySeed()) })
  }

  function startDuel(seed) {
    startGame({ mode: 'duel', deck: seededShuffle([...LETTER_POOL], seed) })
  }

  function recomputeValidity() {
    const sel = selection.value
    grid.value.forEach((c) => {
      c.selected = sel.includes(c.id)
      c.valid = false
    })
    if (sel.length >= 5) {
      const word = wordFromSelection(grid.value, sel)
      if (checkWord(word)) sel.forEach((id) => (grid.value[id].valid = true))
    }
  }

  function handleCellClick(id) {
    const cell = grid.value[id]
    if (!cell || !cell.revealed || cell.gone) return
    const sel = selection.value
    if (sel.includes(id)) {
      if (sel[sel.length - 1] !== id) return // on ne retire que la dernière
      selection.value = sel.slice(0, -1)
    } else {
      selection.value = [...sel, id]
    }
    recomputeValidity()
  }

  function clearSelection() {
    selection.value = []
    grid.value.forEach((c) => {
      c.selected = false
      c.valid = false
    })
  }

  function validate() {
    const ui = useUiStore()
    const sel = selection.value
    if (sel.length < 5) return
    const word = wordFromSelection(grid.value, sel)

    if (!checkWord(word)) {
      ui.showToast(`"${word}" absent du dictionnaire`)
      shakeToken.value++
      return
    }

    if (wordList.value.includes(word)) {
      ui.showToast(`"${word}" déjà dans la liste !`)
      mistakes.value++
      shakeToken.value++
      if (mistakes.value >= MAX_MISTAKES) {
        setTimeout(() => gameOver('mistakes'), 500)
      } else {
        setTimeout(() => clearSelection(), 700)
      }
      return
    }

    const ids = [...sel]
    const prevBonus = calcBonus([...wordList.value])
    wordList.value = [...wordList.value, word]
    score.value += word.length

    const nextBonus = calcBonus(wordList.value)
    if (nextBonus.fig > prevBonus.fig && nextBonus.figLabel) {
      score.value += nextBonus.fig - prevBonus.fig
      ui.showBonus(nextBonus.figLabel)
    }

    activeTab.value = tabForLength(word.length)

    ids.forEach((id) => {
      grid.value[id].gone = true
      grid.value[id].selected = false
      grid.value[id].valid = false
    })
    selection.value = []

    // Mot validé alors que la grille était pleine : relancer le chrono.
    if (lastCardTimer) {
      clearTimeout(lastCardTimer)
      lastCardTimer = null
      setTimeout(() => {
        if (active) scheduleNext()
      }, GONE_ANIM_MS + 10)
    }

    // Après l'animation de disparition, vider les cases (retour face cachée).
    setTimeout(() => {
      ids.forEach((id) => {
        grid.value[id] = emptyCell(id)
      })
    }, GONE_ANIM_MS)
  }

  async function gameOver(reason) {
    clearTimers()
    if (gameOverReason.value) return // évite un double déclenchement
    active = false
    gameOverReason.value = reason

    // Synchroniser le score avec le total détaillé (lettres + bonus + figures).
    const { total } = computeFinalScore(wordList.value)
    score.value = total

    const level = DIFFICULTY[diffIdx.value].label
    lastResult.value = { score: total, level, wordCount: wordList.value.length }

    router.push({ name: 'gameover' })

    await saveGame(total, [...wordList.value], level)
    if (mode.value === 'duel') {
      const duel = useDuelStore()
      duel.saveScore(total)
    }
  }

  async function saveGame(finalScore, words, level) {
    const auth = useAuthStore()
    if (!auth.user) return
    await supabase.from('games').insert({
      user_id: auth.user.id,
      score: finalScore,
      word_count: words.length,
      words,
      level,
      is_daily: mode.value === 'daily',
      created_at: new Date().toISOString(),
    })
    await auth.setBestScore(finalScore)
  }

  /** Arrête les timers (à appeler quand on quitte l'écran de jeu sans game over). */
  function stop() {
    active = false
    clearTimers()
  }

  return {
    grid,
    selection,
    wordList,
    score,
    mistakes,
    activeTab,
    diffIdx,
    mode,
    isDaily,
    isDuel,
    gameOverReason,
    lastResult,
    shakeToken,
    currentPhase,
    wordsByLength,
    startSolo,
    startDaily,
    startDuel,
    handleCellClick,
    clearSelection,
    validate,
    gameOver,
    stop,
  }
})
