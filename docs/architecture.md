# Architecture

## Vue d'ensemble

Application **mono-page Vue 3**. Aucun serveur applicatif propre : le front parle
directement à **Supabase** (Auth + Postgres + Realtime). Build et dev via **Vite**.

```
Navigateur
  └─ Vue 3 (Vues + Composants)
       ├─ Pinia (stores : état global)
       │     └─ src/lib (logique pure)
       └─ Supabase JS  ──►  Supabase (Auth, Postgres, Realtime)
```

## Couches

### `src/lib/` — logique pure (sans Vue)

Modules sans dépendance à Vue ni au DOM, donc **testables unitairement** :

| Fichier         | Rôle                                                                  |
| --------------- | --------------------------------------------------------------------- |
| `constants.js`  | Constantes de jeu (grille, difficultés, phases, sac de lettres, emojis). |
| `scoring.js`    | `calcBonus`, `computeFinalScore` — barème et figures.                 |
| `seed.js`       | Tirages : `shuffle` (aléatoire), `seededShuffle`/`getDailySeed` (déterministe). |
| `grid.js`       | Cases (`emptyCell`), pioche (`drawLetter`), mot courant, onglets.     |
| `dictionary.js` | Chargement ODS + listes en dur + repli, `checkWord`, `deaccent`.     |
| `sanitize.js`   | Nettoyage/validation des pseudos (anti-XSS).                          |
| `supabase.js`   | Client Supabase unique (clés via `import.meta.env`).                  |

### `src/stores/` — état global (Pinia, `setup` stores)

| Store      | Responsabilité                                                              |
| ---------- | -------------------------------------------------------------------------- |
| `auth.js`  | Session, profil, login/signup/logout, édition pseudo/emoji, suppression.   |
| `game.js`  | **Moteur de jeu** : grille, sélection, score, boucle de révélation (timers), fin de partie, sauvegarde. |
| `daily.js` | POP du jour : statut du joueur + classement du jour.                       |
| `duel.js`  | Création/jonction d'un duel, canal Realtime, sauvegarde du score.          |
| `ui.js`    | Toasts, badge de figure, modale active, partie sélectionnée, tutoriel.     |

### `src/views/` — écrans (routés)

`AuthView`, `SplashView` (accueil + choix de difficulté), `GameView` (partie en cours),
`GameOverView` (résultats).

### `src/components/`

- `BrandLogo`, `BottomNav`, `EmojiPicker`, `LoadingScreen`, `ToastHost`, `BonusBadge`,
  `TutorialOverlay`.
- `game/` : `GameGrid`, `WordPanel`, `MistakeDots`, `ProgressDots`.
- `modals/` : `ModalShell` (coque commune) + `Profile`, `Daily`, `Duel`, `GameDetail`,
  `Share`.

## Navigation

`src/router/index.js` — historique **hash** (`#/…`) pour rester compatible GitHub Pages
sans réécriture serveur. Routes : `/` (splash), `/auth`, `/game`, `/gameover`.
Une garde renvoie vers `/auth` si on tente d'accéder au jeu sans être ni connecté ni en
mode invité, une fois le bootstrap terminé.

## Démarrage (bootstrap)

`App.vue` au montage :

1. `auth.bootstrap()` — restaure la session Supabase éventuelle.
2. `loadDictionary()` — télécharge/Construit le dictionnaire (écran de chargement avec
   barre de progression).
3. Redirige vers `/` (connecté) ou `/auth` (sinon).

Les modales, le tutoriel, les toasts et le badge de figure sont montés en permanence
dans `App.vue` et pilotés par le store `ui`.

## Cycle de vie d'une partie (`game.js`)

1. `startSolo / startDaily / startDuel` → `startGame(opts)` : prépare le deck (aléatoire
   ou seedé), crée 20 cases, révèle 5 cartes, navigue vers `/game`, lance la boucle.
2. **Boucle de révélation** (`tick` + `scheduleNext`) : à intervalle (`effectiveMs`,
   variable selon la difficulté ou la phase du POP du jour), révèle une carte cachée
   au hasard. Quand la grille est pleine, un délai annulable précède la fin.
3. **Interaction** : `handleCellClick` construit la sélection, `validate` vérifie le mot
   (dictionnaire), met à jour score/figures, libère les cases.
4. **Fin** (`gameOver`) : fige le score total, navigue vers `/gameover`, sauvegarde la
   partie (et le score de duel le cas échéant).

Les identifiants de timers et le deck sont gardés hors du state réactif (variables de
closure du `setup` store) pour éviter des rendus inutiles.

## Pourquoi cette structure ?

- **Séparation logique / présentation** : la logique pure (`lib`) est testée sans Vue ;
  les composants restent fins.
- **État centralisé** (Pinia) : fin des variables globales et de l'ordre de chargement
  des `<script>` de l'ancienne version vanilla.
- **Interpolation Vue** : protège contre le XSS (cf. `security.md`).
