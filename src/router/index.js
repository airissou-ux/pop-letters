import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', name: 'splash', component: () => import('@/views/SplashView.vue') },
  { path: '/auth', name: 'auth', component: () => import('@/views/AuthView.vue') },
  { path: '/game', name: 'game', component: () => import('@/views/GameView.vue') },
  { path: '/gameover', name: 'gameover', component: () => import('@/views/GameOverView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

// `hash` history : robuste sur GitHub Pages (pas de réécriture serveur nécessaire).
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

// Garde : pages de jeu accessibles seulement une fois le bootstrap terminé.
// Si l'utilisateur n'est ni connecté ni en mode invité, on l'envoie vers /auth.
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!auth.bootstrapped) return true
  const needsEntry = ['game', 'gameover'].includes(to.name)
  if (needsEntry && !auth.isAuthenticated && !auth.isGuest) {
    return { name: 'auth' }
  }
  return true
})

export default router
