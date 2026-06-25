// Logique de grille : cases, pioche de lettres, mot courant.
import { shuffle } from './seed'
import { LETTER_POOL } from './constants'

/** Crée une case vide. */
export function emptyCell(id) {
  return { id, letter: null, revealed: false, selected: false, valid: false, gone: false }
}

/**
 * Pioche une lettre dans le deck (le mute). Recharge un deck mélangé si vide.
 * @param {string[]} deck - tableau muté en place (pioche = shift)
 */
export function drawLetter(deck) {
  if (deck.length === 0) deck.push(...shuffle([...LETTER_POOL]))
  return deck.shift()
}

/** Reconstitue le mot à partir d'une sélection d'indices de cases. */
export function wordFromSelection(grid, selection) {
  return selection.map((id) => grid[id]?.letter || '').join('')
}

/** Onglet (index 0..5) correspondant à la longueur d'un mot. */
export function tabForLength(len) {
  return len >= 10 ? 5 : len >= 9 ? 4 : len >= 8 ? 3 : len >= 7 ? 2 : len >= 6 ? 1 : 0
}
