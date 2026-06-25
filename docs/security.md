# Sécurité

## Modèle de menace en bref

L'application est **100 % côté client** : elle parle directement à Supabase avec la clé
**anon** (publique). La sécurité réelle repose donc sur :

1. les **Row Level Security (RLS)** policies définies dans Supabase (hors de ce dépôt) ;
2. l'**échappement systématique** des données utilisateur dans l'UI (anti-XSS).

## 1. Clés et variables d'environnement

- `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont lues via `import.meta.env`
  (`src/lib/supabase.js`) et fournies par `.env` (jamais commité).
- La clé **anon est publique par conception** : elle finit dans le bundle navigateur.
  Ce n'est pas une fuite. **Ne jamais** mettre la clé `service_role` côté client.
- `.env.example` documente les variables ; `.env` est dans `.gitignore`.

## 2. Anti-XSS

- Vue **échappe** automatiquement l'interpolation `{{ }}`. Tous les contenus
  utilisateur (pseudos du classement, mots, etc.) passent par là → pas d'injection HTML.
  L'ancienne version vanilla utilisait `innerHTML` avec des pseudos → vecteur de **XSS
  stocké** désormais supprimé.
- **Règle** : ne jamais utiliser `v-html` sur des données venant de la base.
- **Défense en profondeur** : les pseudos sont nettoyés à la saisie par
  `sanitizePseudo` (`src/lib/sanitize.js`) — whitelist lettres/chiffres/`_`/`-`/espace,
  donc tout `<`, `>`, `"`, etc. est retiré, à l'inscription comme à l'édition.

## 3. RLS Supabase — à vérifier/durcir

> À faire dans le tableau de bord Supabase (Database → Policies). Non versionné ici.

Recommandations minimales :

- **`profiles`**
  - `SELECT` : autoriser la lecture des champs **publics** uniquement (`id`, `pseudo`,
    `emoji`). Ne pas exposer d'email ni de données sensibles dans cette table.
  - `INSERT`/`UPDATE` : restreint à `auth.uid() = id` (chacun ne modifie que son profil).
  - `DELETE` : `auth.uid() = id`.
- **`games`**
  - `INSERT` : `auth.uid() = user_id` (on n'insère que ses propres parties).
  - `SELECT` : lecture nécessaire pour le classement du jour ; limiter aux colonnes utiles
    si possible.
  - `UPDATE`/`DELETE` : `auth.uid() = user_id`.
- **`duels`**
  - `INSERT` par le créateur ; `UPDATE` restreint aux deux joueurs concernés ;
    `SELECT` par code/participants.
- Activer la **réplication Realtime** sur `duels` (nécessaire au mode duel).

Procédure de vérification rapide : avec un client anon « brut » (clé publique), tenter
un `UPDATE`/`DELETE` sur la ligne d'**un autre** utilisateur. Cela **doit** échouer.

## 4. Dette de sécurité connue

- **Scores falsifiables** : le score est calculé côté client puis inséré dans `games`.
  Un acteur malveillant peut insérer un score arbitraire via l'API. Le classement n'est
  donc pas infalsifiable.
  *Piste* : recalculer/valider le score dans une **Edge Function** Supabase (ou un
  trigger) à partir des `words` et du tirage, et n'accepter que des scores cohérents.
- **Suppression de compte incomplète** : `deleteAccount` (store `auth`) supprime le
  profil et les parties mais **pas** la ligne `auth.users` (impossible avec la clé anon).
  *Piste* : Edge Function avec la clé `service_role` appelant l'Admin API
  (`auth.admin.deleteUser`).

## 5. Dépendances

- Les libs (dont Supabase) sont gérées par **npm** avec versions verrouillées
  (`package-lock.json`) — plus de `<script>` CDN sans intégrité. Tenir les dépendances à
  jour (`npm audit`).
