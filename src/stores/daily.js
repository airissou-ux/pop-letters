import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import { getDailyDate } from '@/lib/seed'

/** Mode « POP du jour » : statut du joueur + classement du jour. */
export const useDailyStore = defineStore('daily', () => {
  const loading = ref(false)
  const alreadyPlayed = ref(false)
  const myScore = ref(null)
  const leaderboard = ref([]) // [{ score, user_id, pseudo, emoji }]

  async function load() {
    const auth = useAuthStore()
    loading.value = true
    alreadyPlayed.value = false
    myScore.value = null
    leaderboard.value = []

    const dateStr = getDailyDate()

    if (auth.user) {
      const { data } = await supabase
        .from('games')
        .select('score')
        .eq('user_id', auth.user.id)
        .eq('is_daily', true)
        .gte('created_at', dateStr)
        .maybeSingle()
      if (data) {
        alreadyPlayed.value = true
        myScore.value = data.score
      }
    }

    const { data: rawScores } = await supabase
      .from('games')
      .select('score, user_id')
      .eq('is_daily', true)
      .gte('created_at', dateStr + 'T00:00:00')
      .order('score', { ascending: false })
      .limit(100)

    const userIds = [...new Set((rawScores || []).map((s) => s.user_id).filter(Boolean))]
    const profilesMap = {}
    if (userIds.length) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, pseudo, emoji')
        .in('id', userIds)
      ;(profs || []).forEach((p) => {
        profilesMap[p.id] = p
      })
    }

    leaderboard.value = (rawScores || []).map((s) => ({
      ...s,
      pseudo: profilesMap[s.user_id]?.pseudo || 'Anonyme',
      emoji: profilesMap[s.user_id]?.emoji || '👤',
    }))
    loading.value = false
  }

  return { loading, alreadyPlayed, myScore, leaderboard, load }
})
