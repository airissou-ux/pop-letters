# Développement

## Prérequis

- **Node.js 18+** (LTS recommandée) et npm.
- Un projet **Supabase** (URL + clé anon) — voir `README.md` étape 4.

## Installation

```bash
git clone https://github.com/airissou-ux/pop-letters.git
cd pop-letters
npm install
cp .env.example .env   # puis renseigner les clés Supabase
npm run dev
```

## Scripts

| Script             | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Serveur de dev (HMR) sur http://localhost:5173 |
| `npm run build`    | Build de production → `dist/`                |
| `npm run preview`  | Sert le build local                          |
| `npm run test`     | Tests unitaires (Vitest)                     |
| `npm run test:watch` | Tests en mode watch                        |
| `npm run lint`     | ESLint                                       |
| `npm run lint:fix` | ESLint + corrections automatiques            |
| `npm run format`   | Prettier                                     |

## Conventions de code

- **Logique pure → `src/lib/`** (testable, sans Vue/DOM). Tout le reste consomme ces
  modules.
- **État partagé → store Pinia** (`src/stores/`). Pas de variable globale.
- Composants en **`<script setup>`**, styles spécifiques en **`<style scoped>`**.
- Style imposé par **Prettier** (`.prettierrc.json`) et **ESLint** (`eslint.config.js`).
- Nommage clair, commentaires utiles en français (cohérent avec l'existant).

## Tests

- Framework : **Vitest**. Fichiers `src/**/*.test.js` (environnement `node`).
- Couvrent la **logique pure** : scoring, tirages déterministes, grille.
- **Règle** : toute nouvelle logique dans `src/lib/` arrive avec ses tests.
- Lancer : `npm run test` (CI l'exécute sur chaque PR).

Exemple de cible testable : une fonction de `src/lib/` qui prend des entrées et renvoie
une sortie déterministe (pas d'accès réseau ni au DOM). Pour tester du code qui dépend de
Supabase, l'isoler derrière une fonction pure ou un mock.

## Workflow Git

1. Partir de `main` à jour : `git switch main && git pull`.
2. Créer une branche : `git switch -c feat/<sujet>` (ou `fix/`, `chore/`).
3. Développer ; vérifier `npm run lint` et `npm run test`.
4. Commits courts à l'impératif, format conventionnel apprécié (`feat:`, `fix:`,
   `chore:`, `docs:`…).
5. Ouvrir une **Pull Request** vers `main`. La CI (lint + test + build) doit être verte.
6. Après merge, le déploiement Pages se déclenche automatiquement.

## Ajouter une variable d'environnement

1. Préfixe **`VITE_`** (sinon Vite ne l'expose pas au client).
2. L'ajouter à `.env` **et** à `.env.example` (sans valeur secrète).
3. La lire via `import.meta.env.VITE_MA_VARIABLE`.

## Dépannage

- **Page blanche / erreur Supabase au démarrage** : vérifier que `.env` existe et que les
  clés sont correctes (un message console explicite est émis sinon).
- **Le dictionnaire ne se charge pas** : la base (`public/dict/ods8.txt`) et le delta
  ODS9 (`public/dict/ods9-delta.txt`) sont servis en same-origin ; vérifier qu'ils sont
  bien présents (et copiés dans `dist/dict/` après `npm run build`). Si le fetch de la
  base échoue, un repli hors-ligne minimal prend le relais (jeu jouable, moins de mots).
  Procédure de mise à jour du dico : voir `docs/game-logic.md` § Dictionnaire.
- **Le mode duel ne démarre pas** : vérifier que la réplication **Realtime** est activée
  sur la table `duels` dans Supabase.
