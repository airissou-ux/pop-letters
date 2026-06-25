import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import { useUiStore } from './ui'

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function genDuelCode() {
  let s = ''
  for (let i = 0; i < 6; i++) s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  return s
}

/** Mode Duel : création/jonction d'un duel synchronisé via Supabase Realtime. */
export const useDuelStore = defineStore('duel', () => {
  const duelId = ref(null)
  const code = ref(null)
  const waiting = ref(false)
  const error = ref(null)

  let channel = null

  function reset() {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
    duelId.value = null
    code.value = null
    waiting.value = false
    error.value = null
  }

  /** Crée un duel et attend l'adversaire (démarre la partie quand status='ready'). */
  async function createDuel() {
    const auth = useAuthStore()
    error.value = null
    if (!auth.user) {
      error.value = 'Connecte-toi pour créer un duel'
      return
    }
    const newCode = genDuelCode()
    const seed = Math.floor(Math.random() * 999999)
    const pseudo = auth.profile?.pseudo || 'Anonyme'
    const { data, error: insErr } = await supabase
      .from('duels')
      .insert({
        code: newCode,
        seed,
        player1_id: auth.user.id,
        player1_pseudo: pseudo,
        status: 'waiting',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (insErr) {
      error.value = 'Erreur création duel'
      return
    }
    duelId.value = data.id
    code.value = newCode
    waiting.value = true

    channel = supabase
      .channel('duel:' + data.id)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'duels', filter: 'id=eq.' + data.id },
        async (p) => {
          if (p.new.status === 'ready') {
            waiting.value = false
            const { useGameStore } = await import('./game')
            useUiStore().closeModal()
            useGameStore().startDuel(seed)
          }
        },
      )
      .subscribe()
  }

  /** Rejoint un duel existant via son code et lance la partie. */
  async function joinDuel(rawCode) {
    error.value = null
    const auth = useAuthStore()
    const joinCode = (rawCode || '').trim().toUpperCase()
    if (joinCode.length < 6) {
      error.value = 'Code invalide'
      return
    }
    const { data, error: selErr } = await supabase
      .from('duels')
      .select('*')
      .eq('code', joinCode)
      .eq('status', 'waiting')
      .single()
    if (selErr || !data) {
      error.value = 'Code introuvable'
      return
    }
    const pseudo = auth.profile?.pseudo || 'Anonyme'
    await supabase
      .from('duels')
      .update({ player2_id: auth.user?.id || null, player2_pseudo: pseudo, status: 'ready' })
      .eq('id', data.id)
    duelId.value = data.id

    const { useGameStore } = await import('./game')
    useUiStore().closeModal()
    useGameStore().startDuel(data.seed)
  }

  /** Enregistre le score du joueur courant sur le duel en cours. */
  async function saveScore(score) {
    const auth = useAuthStore()
    if (!duelId.value || !auth.user) return
    const { data } = await supabase
      .from('duels')
      .select('player1_id')
      .eq('id', duelId.value)
      .single()
    const isP1 = data?.player1_id === auth.user.id
    await supabase
      .from('duels')
      .update({
        [isP1 ? 'player1_score' : 'player2_score']: score,
        [isP1 ? 'player1_done' : 'player2_done']: true,
      })
      .eq('id', duelId.value)
  }

  return { duelId, code, waiting, error, createDuel, joinDuel, saveScore, reset }
})
