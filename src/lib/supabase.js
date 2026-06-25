// Client Supabase unique. Clés lues depuis les variables d'environnement Vite.
// La clé "anon" est publique par conception ; la sécurité repose sur les
// Row Level Security policies (voir docs/security.md).
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Message explicite plutôt qu'un crash obscur à la première requête.
  console.error(
    'Variables Supabase manquantes. Copie .env.example en .env et renseigne ' +
      'VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY (voir README).',
  )
}

export const supabase = createClient(url, anonKey)
