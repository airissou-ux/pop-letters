import { describe, it, expect } from 'vitest'
import { getDailyDate, getDailySeed, seededShuffle, shuffle } from './seed'

describe('getDailyDate', () => {
  it('formate en YYYY-MM-DD avec zéros de tête', () => {
    expect(getDailyDate(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(getDailyDate(new Date(2026, 11, 25))).toBe('2026-12-25')
  })
})

describe('getDailySeed', () => {
  it('est déterministe pour une date donnée', () => {
    const d = new Date(2026, 5, 25)
    expect(getDailySeed(d)).toBe(getDailySeed(d))
  })

  it('diffère entre deux jours', () => {
    expect(getDailySeed(new Date(2026, 5, 25))).not.toBe(getDailySeed(new Date(2026, 5, 26)))
  })
})

describe('seededShuffle', () => {
  const base = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  it('même graine ⇒ même ordre', () => {
    expect(seededShuffle(base, 42)).toEqual(seededShuffle(base, 42))
  })

  it('graines différentes ⇒ ordres différents', () => {
    expect(seededShuffle(base, 1)).not.toEqual(seededShuffle(base, 2))
  })

  it('conserve tous les éléments (permutation)', () => {
    expect([...seededShuffle(base, 7)].sort((a, b) => a - b)).toEqual(base)
  })

  it('ne mute pas le tableau source', () => {
    const copy = [...base]
    seededShuffle(base, 99)
    expect(base).toEqual(copy)
  })
})

describe('shuffle', () => {
  it('conserve tous les éléments', () => {
    const base = [1, 2, 3, 4, 5]
    expect([...shuffle(base)].sort((a, b) => a - b)).toEqual(base)
  })
})
