# Règles et logique de jeu

## But

Former un maximum de mots valides avant que la grille de **20 cases** ne se remplisse.

## Déroulé d'une partie

- La partie démarre avec **5 cartes** révélées.
- Une **nouvelle carte** se révèle à intervalle régulier (selon la difficulté).
- Le joueur tape sur les lettres **dans l'ordre** pour composer un mot
  (longueur **5 à 15** lettres). Retaper la **dernière** lettre la retire ; `✕` efface
  tout.
- **VALIDER** soumet le mot. S'il est dans le dictionnaire et pas déjà joué, les cases
  utilisées disparaissent et libèrent de la place.
- **3 vies** : valider un mot **déjà soumis** coûte une vie. À 0 vie → fin.
- La partie se termine si la **grille est pleine** ou à **0 vie**.

## Difficultés (mode solo)

| Niveau | Icône | Vitesse        |
| ------ | ----- | -------------- |
| Slow   | 🐌    | 1 carte / 5 s  |
| Cool   | 🐢    | 1 carte / 4 s  |
| Sharp  | 🐟    | 1 carte / 3 s  |
| Fast   | 🐎    | 1 carte / 2 s  |
| Insane | 🐦‍🔥    | 1 carte / 1 s  |

Source : `DIFFICULTY` dans `src/lib/constants.js`.

## Scoring (`src/lib/scoring.js`)

- **Base** : chaque lettre d'un mot validé = **1 point**.
- **Bonus de longueur** (par mot) : 6L **+1**, 7L **+2**, 8L **+3**, 9L **+5**, 10L+ **+10**.
- **Figures** (cumulables, comptées indépendamment — un mot peut compter dans plusieurs) :
  - **Quarte** — une série 5+6+7+8 lettres → **+25**
  - **Quinte** — une série 5+6+7+8+9 → **+50**
  - **Quinte Flush** — une série 6+7+8+9+10+ → **+75**

`calcBonus(wordList)` renvoie `{ len, fig, figLabel, qf, q, qa }`.
`computeFinalScore(wordList)` renvoie en plus `base` et `total` (score final affiché à la
fin de partie).

## POP du jour

- **Tirage identique pour tous** un jour donné : le deck est mélangé avec une graine
  déterministe dérivée de la date (`getDailySeed` → `seededShuffle`).
- **Une seule tentative** par jour et par joueur.
- **Vitesse progressive** selon le score (phases) :

| Score   | Phase  | Vitesse |
| ------- | ------ | ------- |
| 0–99    | 🐌 Slow | 5 s     |
| 100–199 | 🐢 Cool | 4 s     |
| 200+    | 🐟 Sharp| 3 s     |

Source : `DAILY_PHASES`.

- **Classement du jour** : podium (top 3) + liste, en temps quasi réel
  (rechargé à l'ouverture de la modale). Voir `daily.js`.

## Duel

- Un joueur **crée** un duel → code à 6 caractères + graine aléatoire partagée.
- L'adversaire **rejoint** via le code. Les deux jouent le **même tirage** (seedé).
- Synchronisation via **Supabase Realtime** (la partie démarre quand le duel passe en
  `ready`). Les scores sont écrits sur la ligne du duel.

## Dictionnaire (`src/lib/dictionary.js`)

- Téléchargé à chaud depuis une liste ODS hébergée sur GitHub.
- Complété par des **listes en dur** (mots en W et K mal couverts) et quelques mots
  accentués mal normalisés.
- **Repli hors-ligne** : si le téléchargement échoue, une petite liste de mots courants
  est chargée pour que le jeu reste jouable.
- Normalisation : `deaccent` (majuscules sans accents) ; seuls les mots de 5 à 15 lettres
  `[A-Z]` sont retenus. `checkWord` teste l'appartenance.
