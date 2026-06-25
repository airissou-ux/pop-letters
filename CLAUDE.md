# CLAUDE.md — POP LETTERS

Guide pour les assistants IA (et les humains) qui travaillent sur ce dépôt.
Lis ce fichier en premier, puis la doc référencée dans `docs/`.

## En une phrase

POP LETTERS est un jeu de mots web (français) contre la montre : des lettres se
révèlent sur une grille de 20 cases, le joueur forme des mots valides (dictionnaire
ODS) avant que la grille ne soit pleine. Modes solo, « POP du jour » (tirage quotidien
partagé + classement) et duel temps réel. Backend : Supabase.

## Stack

- **Vue 3** (Composition API, `<script setup>`) + **Vite** (build/dev).
- **Vue Router** (historique `hash`, compatible GitHub Pages) + **Pinia** (état global).
- **Supabase** : Auth, Postgres, Realtime (`@supabase/supabase-js`).
- **Vitest** (tests unitaires de la logique pure).
- **ESLint** + **Prettier**.
- JavaScript (pas de TypeScript).

## Commandes

```bash
npm install        # installer les dépendances
npm run dev        # serveur de dev (http://localhost:5173)
npm run test       # tests unitaires (Vitest)
npm run lint       # vérifier le style/erreurs
npm run lint:fix   # corriger automatiquement
npm run format     # formater (Prettier)
npm run build      # build de production → dist/
npm run preview    # prévisualiser le build
```

## Architecture (carte rapide)

- `src/lib/` — **logique pure, sans Vue** : `scoring.js`, `seed.js`, `grid.js`,
  `dictionary.js`, `constants.js`, `sanitize.js`, `supabase.js`. C'est ici que vit la
  logique testable. Y ajouter les tests `*.test.js`.
- `src/stores/` — **état global Pinia** : `auth`, `game` (moteur de jeu + timers),
  `daily`, `duel`, `ui` (toasts/badges/modales/tutoriel).
- `src/views/` — **écrans routés** : `AuthView`, `SplashView`, `GameView`, `GameOverView`.
- `src/components/` — composants présentation (`game/`, `modals/`, logo, nav, etc.).
- `src/router/` — routes et garde de navigation.
- `css/style.css` — styles globaux (variables CSS, classes partagées). Réutilisé tel
  quel ; les styles spécifiques à un composant vont dans son `<style scoped>`.

Détails complets : **`docs/architecture.md`**.

## Règles de développement

- **Logique métier dans `src/lib/`**, pas dans les composants. Toute logique pure
  (calcul, transformation) doit être testable sans monter un composant.
- **L'état partagé passe par un store Pinia**, jamais par des variables globales.
- **Pas de `innerHTML` avec des données utilisateur.** Vue échappe l'interpolation
  `{{ }}` par défaut — c'est la protection anti-XSS. Ne pas réintroduire `v-html` sur
  des contenus venant de la base (pseudos, etc.). Voir `docs/security.md`.
- **Ne jamais commiter `.env`** (clés). Utiliser `import.meta.env.VITE_*`. Ajouter toute
  nouvelle variable à `.env.example`.
- **Tests** : toute logique ajoutée à `src/lib/` vient avec ses tests. `npm run test` et
  `npm run lint` doivent passer avant tout merge.

## Branches, commits, merge

- Branche par fonctionnalité : `feat/<sujet>`, `fix/<sujet>`, `chore/<sujet>`.
- Commits courts à l'impératif ; format conventionnel apprécié (`feat:`, `fix:`…).
- Ouvrir une **Pull Request** vers `main`. La CI (lint + test + build) doit être verte.
- `main` est déployée automatiquement sur GitHub Pages. Voir `docs/deployment.md`.

## Documentation (dans `docs/`)

- `architecture.md` — structure du code, flux de données, cycle de vie d'une partie.
- `game-logic.md` — règles, scoring, figures, phases, dictionnaire.
- `data-model.md` — tables Supabase (`profiles`, `games`, `duels`) et leurs colonnes.
- `security.md` — RLS Supabase, anti-XSS, gestion des clés, dette de sécurité connue.
- `development.md` — installation détaillée, workflow, tests, conventions.
- `deployment.md` — build et déploiement GitHub Pages via GitHub Actions.

## Pièges connus / dette

- **Scores calculés côté client** → falsifiables via l'API Supabase. Le classement
  n'est pas infalsifiable. Piste : Edge Function de validation. Voir `docs/security.md`.
- **Suppression de compte** : supprime profil + parties mais **pas** la ligne
  `auth.users` (impossible côté client). Voir `docs/security.md`.
- Le dictionnaire est téléchargé à chaud depuis GitHub ; repli hors-ligne minimal si le
  fetch échoue.
