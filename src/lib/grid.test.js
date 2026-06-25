import { describe, it, expect } from 'vitest'
import { emptyCell, drawLetter, wordFromSelection, tabForLength } from './grid'

describe('emptyCell', () => {
  it('crée une case vierge avec le bon id', () => {
    expect(emptyCell(3)).toEqual({
      id: 3,
      letter: null,
      revealed: false,
      selected: false,
      valid: false,
      gone: false,
    })
  })
})

describe('drawLetter', () => {
  it('pioche depuis le deck (shift)', () => {
    const deck = ['A', 'B', 'C']
    expect(drawLetter(deck)).toBe('A')
    expect(deck).toEqual(['B', 'C'])
  })

  it('recharge un deck mélangé quand il est vide', () => {
    const deck = []
    const letter = drawLetter(deck)
    expect(typeof letter).toBe('string')
    expect(deck.length).toBeGreaterThan(0)
  })
})

describe('wordFromSelection', () => {
  it('reconstitue le mot dans l’ordre de sélection', () => {
    const grid = [
      { letter: 'C' },
      { letter: 'H' },
      { letter: 'A' },
      { letter: 'T' },
    ]
    expect(wordFromSelection(grid, [0, 1, 2, 3])).toBe('CHAT')
    expect(wordFromSelection(grid, [3, 2, 1, 0])).toBe('TAHC')
  })
})

describe('tabForLength', () => {
  it('mappe la longueur vers l’onglet 0..5', () => {
    expect(tabForLength(5)).toBe(0)
    expect(tabForLength(6)).toBe(1)
    expect(tabForLength(9)).toBe(4)
    expect(tabForLength(10)).toBe(5)
    expect(tabForLength(15)).toBe(5)
  })
})
