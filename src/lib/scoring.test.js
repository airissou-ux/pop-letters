import { describe, it, expect } from 'vitest'
import { calcBonus, computeFinalScore } from './scoring'

describe('calcBonus', () => {
  it('aucun bonus pour une liste vide', () => {
    expect(calcBonus([])).toEqual({ len: 0, fig: 0, figLabel: null, qf: 0, q: 0, qa: 0 })
  })

  it('aucun bonus longueur pour un seul mot de 5 lettres', () => {
    const b = calcBonus(['ARBRE'])
    expect(b.len).toBe(0)
    expect(b.figLabel).toBeNull()
  })

  it('applique le barème de longueur (6→+1 … 10+→+10)', () => {
    expect(calcBonus(['ARBRES']).len).toBe(1) // 6L
    expect(calcBonus(['ABCDEFG']).len).toBe(2) // 7L
    expect(calcBonus(['ABCDEFGH']).len).toBe(3) // 8L
    expect(calcBonus(['ABCDEFGHI']).len).toBe(5) // 9L
    expect(calcBonus(['ABCDEFGHIJ']).len).toBe(10) // 10L
    expect(calcBonus(['ABCDEFGHIJKL']).len).toBe(10) // >10 plafonné
  })

  it('détecte une Quarte (5+6+7+8L) → +25', () => {
    const b = calcBonus(['AAAAA', 'AAAAAA', 'AAAAAAA', 'AAAAAAAA'])
    expect(b.qa).toBe(1)
    expect(b.q).toBe(0)
    expect(b.fig).toBe(25)
    expect(b.figLabel).toBe('QUARTE !')
  })

  it('détecte une Quinte (5..9L) → +50', () => {
    const b = calcBonus(['AAAAA', 'AAAAAA', 'AAAAAAA', 'AAAAAAAA', 'AAAAAAAAA'])
    expect(b.q).toBe(1)
    expect(b.qa).toBe(1)
    expect(b.fig).toBe(50 + 25)
    expect(b.figLabel).toBe('QUINTE !')
  })

  it('détecte une Quinte Flush (6..10L) → +75 et libelle au pluriel', () => {
    const words = ['AAAAAA', 'AAAAAAA', 'AAAAAAAA', 'AAAAAAAAA', 'AAAAAAAAAA']
    const b = calcBonus(words)
    expect(b.qf).toBe(1)
    expect(b.figLabel).toBe('QUINTE FLUSH !')
    const doubled = calcBonus([...words, ...words])
    expect(doubled.qf).toBe(2)
    expect(doubled.figLabel).toBe('2× QUINTE FLUSH !')
  })
})

describe('computeFinalScore', () => {
  it('total = lettres + bonus longueur + figures', () => {
    const r = computeFinalScore(['ARBRE', 'ARBRES'])
    expect(r.base).toBe(11) // 5 + 6
    expect(r.len).toBe(1) // un 6L
    expect(r.fig).toBe(0)
    expect(r.total).toBe(12)
  })
})
