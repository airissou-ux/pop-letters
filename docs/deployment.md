# Déploiement (GitHub Pages)

Le site est une application statique buildée par Vite et hébergée sur **GitHub Pages**.
Déploiement **automatique** à chaque push sur `main` via **GitHub Actions**.

## Configuration Vite

`vite.config.js` définit `base: '/pop-letters/'` car Pages sert le site sous le
sous-chemin `https://<utilisateur>.github.io/pop-letters/`. Si le dépôt est renommé,
mettre à jour cette valeur.

Le routeur utilise l'historique **hash** (`#/…`), qui ne nécessite pas de réécriture
serveur — idéal pour Pages.

Les fichiers du dictionnaire (`public/dict/ods8.txt`, `public/dict/ods9-delta.txt`) sont
des **assets statiques** : Vite les copie tels quels dans `dist/dict/` et ils sont servis
sous la `base` (`/pop-letters/dict/…`), chargés en same-origin par l'app — aucune
dépendance réseau externe au démarrage.

## Variables d'environnement en CI

Le build a besoin des clés Supabase. Les définir comme **secrets** du dépôt
(Settings → Secrets and variables → Actions) :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Le workflow les injecte dans l'environnement au moment du `npm run build`.
(Rappel : la clé anon est publique, elle est de toute façon dans le bundle.)

## Activer Pages

Settings → Pages → **Source : GitHub Actions**.

## Workflows

- `.github/workflows/ci.yml` — sur chaque **Pull Request** : `install → lint → test →
  build`. Garde-fou qualité.
- `.github/workflows/deploy.yml` — sur **push `main`** : build puis publication sur Pages
  via les actions officielles (`upload-pages-artifact` + `deploy-pages`).

## Déploiement manuel (dépannage)

```bash
npm ci
npm run build        # génère dist/
npm run preview      # vérification locale
```
Puis publier le contenu de `dist/` sur l'hébergeur de ton choix. Pour un hébergement à la
racine d'un domaine, remettre `base: '/'` dans `vite.config.js`.
