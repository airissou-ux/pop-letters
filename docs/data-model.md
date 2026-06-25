# Modèle de données (Supabase)

Backend : **Supabase** (Postgres). Trois tables applicatives + la table `auth.users`
gérée par Supabase Auth.

> ⚠️ Les définitions ci-dessous sont déduites de l'usage côté client (`src/stores`).
> La source de vérité reste le schéma Supabase. Toute colonne ajoutée doit être
> répercutée ici. Les **politiques RLS** sont décrites dans `security.md`.

## `profiles`

Profil public d'un joueur. Clé `id` = identifiant de l'utilisateur Auth.

| Colonne       | Type        | Notes                                  |
| ------------- | ----------- | -------------------------------------- |
| `id`          | uuid (PK)   | = `auth.users.id`                      |
| `pseudo`      | text        | Unique (vérifié côté client). 3–20 car.|
| `emoji`       | text        | Emoji d'avatar.                        |
| `best_score`  | int         | Meilleur score.                        |
| `total_games` | int         | Compteur (présent, peu utilisé).       |

Accédé par : `auth.js` (chargement/édition profil), `daily.js` (pseudos/emojis du
classement).

## `games`

Une ligne par partie terminée.

| Colonne      | Type        | Notes                                   |
| ------------ | ----------- | --------------------------------------- |
| `id`         | uuid (PK)   |                                         |
| `user_id`    | uuid (FK)   | → `profiles.id` / `auth.users.id`       |
| `score`      | int         | Score final.                            |
| `word_count` | int         | Nombre de mots trouvés.                 |
| `words`      | text[]      | Liste des mots validés.                 |
| `level`      | text        | Libellé de difficulté (`Slow`…).        |
| `is_daily`   | bool        | Vrai si partie « POP du jour ».         |
| `created_at` | timestamptz | Date de la partie.                      |

Accédé par : `game.js` (insertion en fin de partie), `auth.js`/ProfileModal (stats,
historique), `daily.js` (scores du jour).

## `duels`

Une ligne par duel.

| Colonne          | Type        | Notes                                      |
| ---------------- | ----------- | ------------------------------------------ |
| `id`             | uuid (PK)   |                                            |
| `code`           | text        | Code à 6 caractères (jonction).            |
| `seed`           | int         | Graine partagée du tirage.                 |
| `status`         | text        | `waiting` → `ready`.                       |
| `player1_id`     | uuid        | Créateur.                                  |
| `player1_pseudo` | text        |                                            |
| `player1_score`  | int         |                                            |
| `player1_done`   | bool        |                                            |
| `player2_id`     | uuid        | Adversaire (peut être invité → null).      |
| `player2_pseudo` | text        |                                            |
| `player2_score`  | int         |                                            |
| `player2_done`   | bool        |                                            |
| `created_at`     | timestamptz |                                            |

Accédé par : `duel.js`. La transition `waiting → ready` est diffusée via **Realtime**
(`postgres_changes` sur la ligne du duel) pour démarrer les deux parties.

## Realtime

Le mode duel s'abonne au canal `duel:<id>` et écoute les `UPDATE` sur `duels` filtrés
par `id`. Activer la réplication Realtime sur la table `duels` côté Supabase.
