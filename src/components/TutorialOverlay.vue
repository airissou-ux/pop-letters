<script setup>
import { useUiStore, TUTO_STEPS } from '@/stores/ui'
import BrandLogo from './BrandLogo.vue'

const ui = useUiStore()
</script>

<template>
  <div v-if="ui.tutorialVisible" id="tutorial">
    <div class="tuto-box">
      <!-- 0 — intro -->
      <div v-show="ui.tutorialStep === 0" class="tuto-step active">
        <div class="tuto-icon tuto-icon--brand"><BrandLogo variant="tuto" /></div>
        <div class="tuto-text">
          Le jeu de mots solo contre la montre.<br />Des lettres apparaissent progressivement sur
          une grille de <strong>20 cases</strong>. À toi de former des mots avant qu'elle ne soit
          pleine !
        </div>
      </div>

      <!-- 1 -->
      <div v-show="ui.tutorialStep === 1" class="tuto-step active">
        <div class="tuto-icon">👆</div>
        <div class="tuto-title">Former un mot</div>
        <div class="tuto-text">
          Tape sur les lettres dans l'ordre<br />pour composer ton mot.<br />Le mot doit faire
          <strong>5 lettres minimum</strong>.<br />Pour retirer la <strong>dernière lettre</strong>,
          retape dessus. Pour <strong>tout effacer</strong>, appuie sur <strong>✕</strong>.<br />Quand
          ton mot est prêt, appuie sur <strong>VALIDER</strong>.
        </div>
      </div>

      <!-- 2 -->
      <div v-show="ui.tutorialStep === 2" class="tuto-step active">
        <div class="tuto-icon">⏱</div>
        <div class="tuto-title">La pression du temps</div>
        <div class="tuto-text">
          Une nouvelle lettre se révèle à intervalle régulier selon le niveau.<br />Si la
          <strong>grille est pleine</strong>, la partie s'arrête.<br />Tu disposes de
          <strong>3 vies</strong> : valider un mot <strong>déjà soumis</strong> fait perdre une vie.
          À <strong>0 vie</strong>, la partie se termine.
        </div>
      </div>

      <!-- 3 -->
      <div v-show="ui.tutorialStep === 3" class="tuto-step active">
        <div class="tuto-icon">🏆</div>
        <div class="tuto-title">Le score</div>
        <div class="tuto-text">
          Chaque lettre vaut <strong>1 point</strong>. Bonus pour les mots longs :<br /><strong
            >6L +1 · 7L +2 · 8L +3 · 9L +5 · 10L+ +10</strong
          ><br /><br />Figures si tu couvres plusieurs longueurs :<br /><strong>Quarte</strong>
          (5+6+7+8L) <strong>+25 pts</strong><br /><strong>Quinte</strong> (+9L)
          <strong>+50 pts</strong><br /><strong>Quinte Flush</strong> (+10L) <strong>+75 pts</strong>
        </div>
      </div>

      <!-- 4 -->
      <div v-show="ui.tutorialStep === 4" class="tuto-step active">
        <div class="tuto-icon">🐌</div>
        <div class="tuto-title">Choisis ton niveau</div>
        <div class="tuto-text">
          🐌 <strong>Slow</strong> — 1 carte / 5s<br />
          🐢 <strong>Cool</strong> — 1 carte / 4s<br />
          🐟 <strong>Sharp</strong> — 1 carte / 3s<br />
          🐎 <strong>Fast</strong> — 1 carte / 2s<br />
          🐦‍🔥 <strong>Insane</strong> — 1 carte / 1s<br /><br />
          Dictionnaire <strong>ODS</strong> — officiel du Scrabble français.
        </div>
      </div>

      <!-- 5 -->
      <div v-show="ui.tutorialStep === 5" class="tuto-step active">
        <div class="tuto-icon">👤</div>
        <div class="tuto-title">Ton compte joueur</div>
        <div class="tuto-text">
          Crée ton compte avec un <strong>pseudo</strong> et un <strong>emoji</strong> qui te
          représente.<br />Tes parties sont sauvegardées automatiquement.<br />Retrouve ton
          <strong>historique</strong>, ton meilleur score et tes statistiques dans ton profil.
        </div>
      </div>

      <!-- 6 -->
      <div v-show="ui.tutorialStep === 6" class="tuto-step active">
        <div class="tuto-icon">⭐</div>
        <div class="tuto-title">POP du jour</div>
        <div class="tuto-text">
          Chaque jour, <strong>tous les joueurs jouent le même tirage</strong>.<br />Une seule
          tentative — fais le meilleur score !<br />Consulte le <strong>classement du jour</strong>
          en temps réel avec les pseudos et emojis des participants.<br />La vitesse s'accélère
          automatiquement selon ton score.
        </div>
      </div>

      <!-- 7 -->
      <div v-show="ui.tutorialStep === 7" class="tuto-step active">
        <div class="tuto-icon">⚔️</div>
        <div class="tuto-title">Duel &amp; Partage</div>
        <div class="tuto-text">
          <strong>Mode Duel</strong> — génère un code et défie un ami en temps réel. Vous jouez le
          même tirage simultanément.<br /><br /><strong>Partage</strong> — partage ton score sur
          <strong>WhatsApp</strong>, <strong>X</strong> ou par lien direct après chaque partie.
        </div>
      </div>

      <div class="tuto-dots">
        <div
          v-for="i in TUTO_STEPS"
          :key="i"
          class="tuto-dot"
          :class="{ on: i - 1 === ui.tutorialStep }"
        ></div>
      </div>
      <div class="tuto-nav">
        <button v-show="ui.tutorialStep < TUTO_STEPS - 1" class="tuto-skip" @click="ui.closeTutorial()">
          Passer
        </button>
        <button class="tuto-next" @click="ui.nextTutorial()">
          {{ ui.tutorialStep === TUTO_STEPS - 1 ? 'JOUER !' : 'SUIVANT →' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tuto-icon--brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
</style>
