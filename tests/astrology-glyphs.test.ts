import { describe, expect, it } from 'vitest'
import {
  ASTROLOGY_GLYPHS,
  getAstrologyGlyph,
  resolveAstrologySymbol,
  resolveChartBodyGlyph
} from '../src/core/astrology/glyphs'

describe('astrology glyph catalog', () => {
  it('resolves Portuguese and English aliases', () => {
    expect(getAstrologyGlyph('Saturno')).toBe('♄')
    expect(getAstrologyGlyph('north node')).toBe('☊')
    expect(resolveAstrologySymbol('Parte da Fortuna')).toBe('part-of-fortune')
  })

  it('uses explicit overrides before the internal catalog', () => {
    expect(
      resolveChartBodyGlyph({
        id: 'saturn',
        name: 'Saturno',
        glyph: 'S',
        shortLabel: 'Sa'
      })
    ).toBe('Sa')
  })

  it('infers a body glyph without requiring glyph data', () => {
    expect(
      resolveChartBodyGlyph({
        id: 'custom-ruler',
        name: 'Saturno',
        symbol: 'saturn'
      })
    ).toBe(ASTROLOGY_GLYPHS.saturn)
  })
})
