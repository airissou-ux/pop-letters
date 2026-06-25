// Dictionnaire ODS : chargé depuis les fichiers locaux `public/dict/`
// (ODS8 complet + delta ODS9), avec un repli hors-ligne minimal.
import { DICT_URL, DICT_DELTA_URL, MIN_WORD_LEN, MAX_WORD_LEN } from './constants'

const dict = new Set()

/** Majuscule sans accents (NFD + suppression des diacritiques). */
export function deaccent(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
}

/** Vrai si le mot (normalisé) est dans le dictionnaire. */
export function checkWord(word) {
  const clean = deaccent(word).replace(/[^A-Z]/g, '')
  return dict.has(clean)
}

export function getDictSize() {
  return dict.size
}

function addWord(raw) {
  const clean = deaccent(raw).replace(/[^A-Z]/g, '')
  if (clean.length >= MIN_WORD_LEN && clean.length <= MAX_WORD_LEN) dict.add(clean)
}

// Repli hors-ligne : petite liste de mots courants si le fetch échoue.
const FALLBACK_WORDS = `ABAISSER ABATTRE ABRITER ACCEDER ACHETER AJOUTER ALLUMER
AMENER AMUSER APPELER APPORTER ARRETER ARRIVER ASSURER ATTEINDRE ATTENDRE
BAISSER BALADE BALLADE BATTRE BLESSER BRILLER BRISER
CASSER CHANTER CHERCHER CLAQUER COLLER COMPTER COUPER COURIR COUVRIR CROIRE
DANSER DECOUVRIR DEMANDER DONNER DORMIR DRESSER
ECOUTER ECRIRE ENTRER ESPERER ESSAYER ETUDIER EVITER EXISTER
FAIRE FALLOIR FERMER FINIR FLOTTER FORMER FRAPPER
GAGNER GARDER GLISSER GRANDIR
HABITER HAUSSER HURLER IMAGINER IMITER IMPOSER
JOUER JETER JUGER LANCER LAISSER LEVER LIBERER LUTTER
MARCHER MENTIR METTRE MONTER MOURIR
NOMMER NOTER NOURRIR OBTENIR OUVRIR
PARLER PARTIR PASSER PENSER PERDRE PLAIRE PORTER POSER POUSSER PRENDRE POUVOIR
RANGER RATER REFUSER RENDRE RENTRER RESTER RETIRER REVENIR
SAVOIR SEMBLER SERVIR SORTIR SOUFFRIR SUIVRE
TENDRE TERMINER TENIR TIRER TOMBER TOUCHER TROUVER
UTILISER VALOIR VENDRE VENIR VIVRE VOIR VOLER
FRANGE TOUTE TOURTE CHOUETTE TABLE PIANO SURFER
CHAISE FLEUR ARBRE MAISON JARDIN VOITURE ENFANT AMOUR MONDE`

/** Charge le repli hors-ligne dans le dictionnaire. */
export function loadFallback() {
  FALLBACK_WORDS.trim()
    .split(/\s+/)
    .forEach((w) => addWord(w))
}

/**
 * Télécharge et construit le dictionnaire.
 * @param {(progress:number, message:string) => void} [onProgress]
 * @returns {Promise<{ ok: boolean, size: number }>} ok=false si repli utilisé.
 */
export async function loadDictionary(onProgress = () => {}) {
  try {
    onProgress(10, 'Connexion au dictionnaire ODS…')
    const [base, delta] = await Promise.all([fetch(DICT_URL), fetch(DICT_DELTA_URL)])
    if (!base.ok) throw new Error('HTTP ' + base.status)
    onProgress(40, 'Téléchargement en cours…')
    const baseText = await base.text()
    // Le delta ODS9 est optionnel : on ignore son échec sans casser le chargement.
    const deltaText = delta.ok ? await delta.text() : ''
    onProgress(70, 'Construction du dictionnaire…')
    for (const line of (baseText + '\n' + deltaText).split('\n')) {
      const w = line.trim()
      if (w) addWord(w)
    }
    onProgress(100, `${dict.size.toLocaleString()} mots chargés ✓`)
    return { ok: true, size: dict.size }
  } catch {
    loadFallback()
    onProgress(100, 'Hors ligne — dictionnaire de secours chargé')
    return { ok: false, size: dict.size }
  }
}
