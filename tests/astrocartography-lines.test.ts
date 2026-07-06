import { describe, expect, it } from 'vitest'
import { buildAstrocartographyLines } from '../src/core/astrocartography/lines'
import type { AstrocartographyEquatorialPosition } from '../src/core/astrocartography/types'

const position: AstrocartographyEquatorialPosition = {
  planet: 'sun',
  name: 'Sol',
  rightAscensionHours: 10,
  declinationDegrees: 12
}

describe('buildAstrocartographyLines', () => {
  it('gera os quatro ângulos para cada planeta', () => {
    const lines = buildAstrocartographyLines([position], 10)

    expect(lines).toHaveLength(4)
    expect(lines.map((line) => line.angle)).toEqual(['MC', 'IC', 'ASC', 'DSC'])
  })

  it('posiciona MC em Greenwich quando a ascensão reta coincide com o tempo sideral', () => {
    const lines = buildAstrocartographyLines([position], 10)
    const mc = lines.find((line) => line.angle === 'MC')
    const ic = lines.find((line) => line.angle === 'IC')

    expect(mc?.segments[0]?.[0]?.longitude).toBeCloseTo(0, 8)
    expect(Math.abs(ic?.segments[0]?.[0]?.longitude ?? 0)).toBeCloseTo(180, 8)
  })

  it('mantém curvas dentro dos limites geográficos e separa o antimeridiano', () => {
    const lines = buildAstrocartographyLines([position], 10)
    const horizonLines = lines.filter((line) => line.angle === 'ASC' || line.angle === 'DSC')

    expect(horizonLines.every((line) => line.segments.length > 0)).toBe(true)

    for (const line of horizonLines) {
      for (const segment of line.segments) {
        for (const [index, point] of segment.entries()) {
          expect(point.latitude).toBeGreaterThanOrEqual(-89)
          expect(point.latitude).toBeLessThanOrEqual(89)
          expect(point.longitude).toBeGreaterThanOrEqual(-180)
          expect(point.longitude).toBeLessThan(180)

          if (index > 0) {
            expect(
              Math.abs(point.longitude - (segment[index - 1]?.longitude ?? 0))
            ).toBeLessThanOrEqual(180)
          }
        }
      }
    }
  })
})
