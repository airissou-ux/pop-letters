import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { sanitizePseudo, isValidPseudo } from '@/lib/sanitize'
import { DEFAULT_EMOJI } from '@/lib/constants'

/** Authentification et profil joueur (Supabase Auth + table `profiles`). */
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const isGuest = ref(false)
  const bootstrapped = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const displayEmoji = computed(() => profile.value?.emoji || '👤')
  const displayPseudo = computed(() => {
    const p = profile.value?.pseudo
    if (!p) return 'Profil'
    return p.length > 8 ? p.slice(0, 8) + '…' : p
  })

  /** Restaure la session existante au démarrage (résilient aux erreurs réseau). */
  async function bootstrap() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        user.value = session.user
        await loadProfile()
      }
    } catch (e) {
      console.error('bootstrap:', e?.message || e)
    } finally {
      bootstrapped.value = true
    }
  }

  async function loadProfile() {
    if (!user.value) return
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .maybeSingle()
    if (error) {
      console.error('loadProfile:', error.message)
      return
    }
    if (data) {
      profile.value = data
    } else {
      const blank = { id: user.value.id, emoji: DEFAULT_EMOJI, best_score: 0, total_games: 0 }
      await supabase.from('profiles').upsert(blank, { onConflict: 'id' })
      profile.value = blank
    }
  }

  /** Inscription : crée le compte Auth puis le profil. Lève une Error en cas d'échec. */
  async function signup({ email, password, pseudo, emoji }) {
    const clean = sanitizePseudo(pseudo)
    if (!isValidPseudo(clean)) throw new Error('Pseudo requis (3 caractères min.)')
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('pseudo', clean)
      .maybeSingle()
    if (existing) throw new Error('Ce pseudo est déjà pris.')

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    user.value = data.user
    if (!user.value) throw new Error('Compte non créé. Réessaie.')

    const { data: pd, error: pe } = await supabase
      .from('profiles')
      .upsert(
        { id: user.value.id, pseudo: clean, emoji: emoji || DEFAULT_EMOJI, best_score: 0, total_games: 0 },
        { onConflict: 'id' },
      )
      .select()
      .maybeSingle()
    if (pe) throw new Error('Profil non créé: ' + pe.message)
    profile.value = pd || { id: user.value.id, pseudo: clean, emoji: emoji || DEFAULT_EMOJI }
    isGuest.value = false
  }

  /** Connexion par email/mot de passe. Lève une Error en cas d'échec. */
  async function login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data.user
    isGuest.value = false
    await loadProfile()
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
    isGuest.value = false
  }

  function continueAsGuest() {
    isGuest.value = true
  }

  /** Met à jour le pseudo (déjà validé/sanitizé en amont). */
  async function updatePseudo(raw) {
    const clean = sanitizePseudo(raw)
    if (!isValidPseudo(clean) || !user.value) throw new Error('Pseudo invalide')
    const { error } = await supabase.from('profiles').update({ pseudo: clean }).eq('id', user.value.id)
    if (error) throw error
    profile.value = { ...profile.value, pseudo: clean }
  }

  /** Vérifie la disponibilité d'un pseudo (hors pseudo actuel). */
  async function isPseudoAvailable(raw) {
    const clean = sanitizePseudo(raw)
    if (clean === profile.value?.pseudo) return true
    const { data } = await supabase.from('profiles').select('id').eq('pseudo', clean).maybeSingle()
    return !data
  }

  async function updateEmoji(emoji) {
    if (!emoji || !user.value) return
    const { error } = await supabase.from('profiles').update({ emoji }).eq('id', user.value.id)
    if (error) throw error
    profile.value = { ...profile.value, emoji }
  }

  async function setBestScore(score) {
    if (!profile.value || score <= (profile.value.best_score || 0)) return
    await supabase.from('profiles').update({ best_score: score }).eq('id', user.value.id)
    profile.value = { ...profile.value, best_score: score }
  }

  /**
   * Supprime les données joueur (parties + profil) et déconnecte.
   * NB : la ligne `auth.users` n'est PAS supprimable côté client — voir docs/security.md.
   */
  async function deleteAccount() {
    if (!user.value) return
    await supabase.from('games').delete().eq('user_id', user.value.id)
    await supabase.from('profiles').delete().eq('id', user.value.id)
    await logout()
  }

  return {
    user,
    profile,
    isGuest,
    bootstrapped,
    isAuthenticated,
    displayEmoji,
    displayPseudo,
    bootstrap,
    loadProfile,
    signup,
    login,
    logout,
    continueAsGuest,
    updatePseudo,
    isPseudoAvailable,
    updateEmoji,
    setBestScore,
    deleteAccount,
  }
})
