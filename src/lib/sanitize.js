// Validation/nettoyage des entrées utilisateur (anti-XSS, cohérence pseudo).

export const PSEUDO_MIN = 3
export const PSEUDO_MAX = 20

/** Caractères autorisés dans un pseudo : lettres, chiffres, _ et - et espace. */
const PSEUDO_ALLOWED = /[^\p{L}\p{N} _-]/gu

/**
 * Nettoie un pseudo : retire les caractères interdits (dont tout HTML/JS),
 * normalise les espaces et tronque à PSEUDO_MAX.
 */
export function sanitizePseudo(raw) {
  return (raw || '')
    .replace(PSEUDO_ALLOWED, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, PSEUDO_MAX)
}

/** Un pseudo est valide s'il fait au moins PSEUDO_MIN caractères après nettoyage. */
export function isValidPseudo(raw) {
  return sanitizePseudo(raw).length >= PSEUDO_MIN
}
