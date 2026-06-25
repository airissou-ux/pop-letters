// Constantes de jeu — partagées par les stores, composables et vues.

/** Nombre de cases de la grille. */
export const GRID_SIZE = 20

/** Nombre de cartes révélées au démarrage d'une partie. */
export const INITIAL_REVEALED = 5

/** Vies : valider un mot déjà soumis coûte une vie, 0 vie = game over. */
export const MAX_MISTAKES = 3

/** Longueurs de mot acceptées. */
export const MIN_WORD_LEN = 5
export const MAX_WORD_LEN = 15

/**
 * Dictionnaire ODS, versionné en local dans `public/dict/` (servi en
 * same-origin, respecte la base Vite pour GitHub Pages).
 * - `ods8.txt`       : liste ODS8 complète (5–15 lettres, MAJUSCULES ASCII).
 * - `ods9-delta.txt` : nouveaux mots ODS9 superposés à l'ODS8.
 */
export const DICT_URL = import.meta.env.BASE_URL + 'dict/ods8.txt'
export const DICT_DELTA_URL = import.meta.env.BASE_URL + 'dict/ods9-delta.txt'

/** Niveaux de difficulté (vitesse de révélation des cartes). */
export const DIFFICULTY = [
  { label: 'Slow', icon: '🐌', ms: 5000 },
  { label: 'Cool', icon: '🐢', ms: 4000 },
  { label: 'Sharp', icon: '🐟', ms: 3000 },
  { label: 'Fast', icon: '🐎', ms: 2000 },
  { label: 'Insane', icon: '🐦‍🔥', ms: 1000 },
]

/**
 * Phases du mode « POP du jour » : la vitesse accélère avec le score.
 * Ordonnées par seuil décroissant pour un `.find(p => score >= p.min)`.
 */
export const DAILY_PHASES = [
  { min: 200, icon: '🐟', label: 'Sharp', ms: 3000 },
  { min: 100, icon: '🐢', label: 'Cool', ms: 4000 },
  { min: 0, icon: '🐌', label: 'Slow', ms: 5000 },
]

/** Onglets de la liste des mots trouvés, par longueur. */
export const TAB_LABELS = ['5 L', '6 L', '7 L', '8 L', '9 L', '10+ L']

/** Sac de lettres (fréquences façon Scrabble FR). */
export const LETTER_POOL = [
  ...Array(9).fill('A'), ...Array(2).fill('B'), ...Array(2).fill('C'),
  ...Array(3).fill('D'), ...Array(15).fill('E'), ...Array(2).fill('F'),
  ...Array(2).fill('G'), ...Array(2).fill('H'), ...Array(8).fill('I'),
  ...Array(1).fill('J'), ...Array(1).fill('K'), ...Array(5).fill('L'),
  ...Array(3).fill('M'), ...Array(6).fill('N'), ...Array(6).fill('O'),
  ...Array(2).fill('P'), ...Array(1).fill('Q'), ...Array(6).fill('R'),
  ...Array(6).fill('S'), ...Array(6).fill('T'), ...Array(6).fill('U'),
  ...Array(2).fill('V'), ...Array(1).fill('W'), ...Array(1).fill('X'),
  ...Array(1).fill('Y'), ...Array(1).fill('Z'),
]

/** Icônes de niveau pour les anciennes parties (compat historique). */
export const LEGACY_LEVEL_ICONS = {
  Moon: '🌙', Star: '⭐', Comet: '☄️', Nova: '🌟', Supernova: '💫',
}

/** Emojis de profil, groupés par catégorie. */
export const EMOJI_CATEGORIES = {
  Animaux: ['🐶','🐱','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐧','🦆','🦅','🦉','🐺','🐴','🦄','🐝','🦋','🐌','🐢','🐍','🐙','🐠','🐟','🐬','🐳','🦈','🐆','🐅','🦒','🐘','🐕','🐈','🐇','🦔'],
  Visages: ['😀','😎','🥳','🤩','😍','🥰','🙂','🤗','🤔','😏','🤓','🧐','😈','👿','💀','👻','👽','🤖','💩','🎃'],
  Sports: ['⚽','🏀','🎾','🎱','🥊','🥋','🎯','🎮','🕹','🎲','🎨','🎤','🎸','🎵','🎶','🏆','🥇'],
  Nature: ['🌸','🌺','🌻','🌹','🍀','🌿','🌵','🌲','🌴','🌊','🌈','❄','🔥','⚡','🌙','⭐','🌟','💫','✨','☄','🌞','🪐'],
  Objets: ['💎','👑','🏆','🎯','💡','🔑','💰','💻','📱','🎁','🎀','🧸','❤','🧡','💛','💚','💙','💜','🖤','🤍','💯'],
}

export const DEFAULT_EMOJI = '🎯'
