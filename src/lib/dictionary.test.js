import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { deaccent, checkWord, getDictSize, loadDictionary, loadFallback } from './dictionary'

describe('deaccent', () => {
  it('met en majuscules et retire les accents', () => {
    expect(deaccent('été')).toBe('ETE')
    expect(deaccent('Pâté')).toBe('PATE')
    expect(deaccent('français')).toBe('FRANCAIS')
  })
})

describe('checkWord / loadDictionary', () => {
  beforeEach(() => {
    // ODS8 (base) + delta ODS9, servis par fetch mocké selon l'URL.
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        const body = url.includes('delta')
          ? 'ABAYA\nZUCCHINI\n' // delta ODS9
          : 'MAISON\nTWEET\nKEBAB\nflute\n' // base ODS8 (casse/accents normalisés à l'ajout)
        return Promise.resolve({ ok: true, text: () => Promise.resolve(body) })
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('charge la base + le delta et valide les mots (normalisés)', async () => {
    const res = await loadDictionary()
    expect(res.ok).toBe(true)
    expect(getDictSize()).toBeGreaterThan(0)

    expect(checkWord('maison')).toBe(true) // base, insensible à la casse
    expect(checkWord('TWEET')).toBe(true) // mot en W
    expect(checkWord('kebab')).toBe(true) // mot en K
    expect(checkWord('flûte')).toBe(true) // accents retirés à la validation
    expect(checkWord('ABAYA')).toBe(true) // nouveau mot ODS9 (delta)
    expect(checkWord('zucchini')).toBe(true) // delta
    expect(checkWord('ZZZZZ')).toBe(false) // non-mot rejeté
  })

  it('bascule sur le repli hors-ligne si le fetch échoue', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('offline'))),
    )
    const res = await loadDictionary()
    expect(res.ok).toBe(false)
    expect(getDictSize()).toBeGreaterThan(0)
    expect(checkWord('MAISON')).toBe(true) // présent dans FALLBACK_WORDS
  })
})

describe('loadFallback', () => {
  it('ignore les mots trop courts (< 5 lettres)', () => {
    loadFallback()
    expect(checkWord('MAISON')).toBe(true)
  })
})
