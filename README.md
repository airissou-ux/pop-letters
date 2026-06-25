# 🎮 POP LETTERS

Jeu de mots web contre la montre. Des lettres se révèlent sur une grille de 20 cases ;
forme des mots valides (dictionnaire officiel du Scrabble français — ODS) avant que la
grille ne soit pleine. Modes **solo**, **POP du jour** (tirage quotidien + classement)
et **duel** en temps réel.

> Construit avec **Vue 3 + Vite**, backend **Supabase**.

---

## 🚀 Mettre en place l'environnement (pas à pas, macOS)

Ce guide est écrit pour **macOS** et part de zéro — aucune connaissance préalable
requise. Toutes les commandes se tapent dans le **Terminal**.

### 0. Ouvrir le Terminal

C'est l'application où l'on tape les commandes.

- Appuie sur **`Cmd` (⌘) + Espace** (Spotlight), tape **`Terminal`**, puis `Entrée`.
- Une fenêtre avec du texte s'ouvre : c'est là que tout se passe. Pour exécuter une
  commande, on la colle puis on appuie sur `Entrée`.

### 1. Installer Node.js

Node.js est l'outil qui fait tourner le projet sur ton ordinateur.

- Va sur **https://nodejs.org** et télécharge la version **LTS** (bouton de gauche).
- Tu obtiens un fichier `.pkg` : double-clique dessus et suis l'installateur (Continuer →
  Continuer → Installer). C'est l'installation la plus simple, **pas besoin de Homebrew**.
- Vérifie ensuite, dans le Terminal :
  ```bash
  node --version
  ```
  Tu dois voir un numéro (ex. `v20.x` ou plus). Si oui, c'est bon. Il faut **Node 18 ou
  plus récent**.

> 💡 Sur Mac, **Git** (pour l'étape 2) est généralement déjà présent. Si la première
> commande `git` affiche une fenêtre proposant d'installer les « outils de développement
> en ligne de commande » (Command Line Tools), accepte : c'est normal et automatique.

### 2. Récupérer le code

Par défaut, les commandes ci-dessous téléchargent le projet dans ton dossier personnel
(`/Users/ton-nom/pop-letters`).

```bash
git clone https://github.com/airissou-ux/pop-letters.git
cd pop-letters
```

### 3. Installer les dépendances

```bash
npm install
```
Cette commande télécharge tout ce dont le projet a besoin (dans un dossier
`node_modules/`). Ça peut prendre une minute.

### 4. Configurer les clés Supabase

Le jeu a besoin de se connecter à une base de données (Supabase) pour les comptes et les
scores.

```bash
cp .env.example .env
```
Ouvre ensuite le fichier `.env` et remplis les deux valeurs. Pour les trouver :
tableau de bord Supabase → **Project Settings → API**

- `VITE_SUPABASE_URL` = le champ « Project URL »
- `VITE_SUPABASE_ANON_KEY` = la clé « anon public »

> ℹ️ La clé « anon » est **publique** par conception (elle part dans le navigateur).
> N'utilise **jamais** la clé « service_role » ici. Détails : `docs/security.md`.

### 5. Lancer le jeu

```bash
npm run dev
```
Ouvre l'adresse affichée (généralement **http://localhost:5173**). Le jeu se recharge
tout seul quand tu modifies le code.

---

## 🧰 Commandes utiles

| Commande           | Effet                                              |
| ------------------ | -------------------------------------------------- |
| `npm run dev`      | Lance le serveur de développement                  |
| `npm run test`     | Lance les tests automatiques                       |
| `npm run lint`     | Vérifie la qualité du code                         |
| `npm run lint:fix` | Corrige automatiquement ce qui peut l'être         |
| `npm run format`   | Met en forme le code (Prettier)                    |
| `npm run build`    | Prépare la version de production (dossier `dist/`) |
| `npm run preview`  | Prévisualise la version de production              |

---

## 📁 Où se trouve quoi ?

```
src/
├── lib/          # logique pure du jeu (score, dictionnaire, tirages…) — testée
├── stores/       # état global de l'app (Pinia)
├── views/        # les grands écrans (auth, accueil, jeu, fin de partie)
├── components/   # briques d'interface réutilisables
└── router/       # navigation entre écrans
css/style.css     # styles globaux
docs/             # documentation technique détaillée
```

Pour comprendre le projet en profondeur, commence par **`CLAUDE.md`** puis le dossier
**`docs/`**.

---

## 🚢 Déploiement

L'application se déploie automatiquement sur **GitHub Pages** à chaque envoi sur la
branche `main` (via GitHub Actions). Voir **`docs/deployment.md`**.

---

## 📝 Licence

Projet personnel. Dictionnaire ODS issu de données publiques.
