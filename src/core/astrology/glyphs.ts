import type { AstrologicalChartBody, AstrologicalSymbolId } from './types'

export const ASTROLOGY_GLYPHS: Readonly<Record<AstrologicalSymbolId, string>> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  earth: '⊕',
  chiron: '⚷',
  lilith: '⚸',
  'north-node': '☊',
  'south-node': '☋',
  'part-of-fortune': '⊗',
  vertex: 'Vx',
  ceres: '⚳',
  pallas: '⚴',
  juno: '⚵',
  vesta: '⚶',
  ascendant: 'ASC',
  descendant: 'DSC',
  midheaven: 'MC',
  'imum-coeli': 'IC'
}

const SYMBOL_ALIASES: Readonly<Record<string, AstrologicalSymbolId>> = {
  sol: 'sun',
  lua: 'moon',
  mercurio: 'mercury',
  venus: 'venus',
  marte: 'mars',
  saturno: 'saturn',
  urano: 'uranus',
  netuno: 'neptune',
  plutao: 'pluto',
  terra: 'earth',
  quiron: 'chiron',
  'lua-negra': 'lilith',
  'black-moon': 'lilith',
  'black-moon-lilith': 'lilith',
  'nodo-norte': 'north-node',
  'no-norte': 'north-node',
  'ascending-node': 'north-node',
  'true-node': 'north-node',
  'mean-node': 'north-node',
  'nodo-sul': 'south-node',
  'no-sul': 'south-node',
  'descending-node': 'south-node',
  fortuna: 'part-of-fortune',
  'parte-da-fortuna': 'part-of-fortune',
  'part-of-fortune': 'part-of-fortune',
  'pars-fortunae': 'part-of-fortune',
  vertice: 'vertex',
  palas: 'pallas',
  asc: 'ascendant',
  ascendente: 'ascendant',
  dsc: 'descendant',
  descendente: 'descendant',
  mc: 'midheaven',
  'meio-do-ceu': 'midheaven',
  'medium-coeli': 'midheaven',
  ic: 'imum-coeli',
  'fundo-do-ceu': 'imum-coeli',
  aries: 'aries',
  touro: 'taurus',
  gemeos: 'gemini',
  cancer: 'cancer',
  leao: 'leo',
  virgem: 'virgo',
  libra: 'libra',
  escorpiao: 'scorpio',
  sagitario: 'sagittarius',
  capricornio: 'capricorn',
  aquario: 'aquarius',
  peixes: 'pisces'
}

type BodyGlyphSource = Pick<
  AstrologicalChartBody,
  'glyph' | 'id' | 'name' | 'shortLabel' | 'symbol'
>

function normalizeSymbolName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function resolveAstrologySymbol(value?: string | null): AstrologicalSymbolId | undefined {
  if (!value) return undefined

  const normalized = normalizeSymbolName(value)

  if (Object.prototype.hasOwnProperty.call(ASTROLOGY_GLYPHS, normalized)) {
    return normalized as AstrologicalSymbolId
  }

  return SYMBOL_ALIASES[normalized]
}

export function getAstrologyGlyph(value?: string | null): string | undefined {
  const symbol = resolveAstrologySymbol(value)
  return symbol ? ASTROLOGY_GLYPHS[symbol] : undefined
}

function fallbackBodyLabel(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) return '•'
  if (words.length === 1) return words[0].slice(0, 2)

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
}

export function resolveChartBodyGlyph(body: BodyGlyphSource): string {
  return (
    body.shortLabel?.trim() ||
    body.glyph?.trim() ||
    getAstrologyGlyph(body.symbol) ||
    getAstrologyGlyph(body.id) ||
    getAstrologyGlyph(body.name) ||
    fallbackBodyLabel(body.name)
  )
}
