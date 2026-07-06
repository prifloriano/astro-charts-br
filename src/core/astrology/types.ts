/**
 * Tipos públicos compartilhados por todos os componentes astrológicos.
 *
 * Longitudes são sempre absolutas, no intervalo de 0° a 360°:
 * 0° = 0° de Áries, 30° = 0° de Touro, e assim por diante.
 */

export type ZodiacSignId =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces'

export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export type CelestialBodyKind = 'planet' | 'point' | 'asteroid'

export type AstrologicalSymbolId =
  | ZodiacSignId
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto'
  | 'earth'
  | 'chiron'
  | 'lilith'
  | 'north-node'
  | 'south-node'
  | 'part-of-fortune'
  | 'vertex'
  | 'ceres'
  | 'pallas'
  | 'juno'
  | 'vesta'
  | 'ascendant'
  | 'descendant'
  | 'midheaven'
  | 'imum-coeli'

export type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition'

export type AspectMotion = 'applying' | 'separating'

export interface AstrologicalChartAngles {
  ascendant: number
  midheaven: number
  descendant?: number
  imumCoeli?: number
}

export interface AstrologicalHouseCusp {
  house: HouseNumber
  longitude: number
}

export interface AstrologicalChartBody<TRole extends string = string> {
  /** Identificador estável usado para ligar o corpo aos aspectos. */
  id: string
  name: string
  /**
   * Identificador canônico usado para escolher o glifo interno.
   * É opcional quando `id` ou `name` já identifica o corpo.
   */
  symbol?: AstrologicalSymbolId
  /** Sobrescrita opcional do glifo fornecido pela biblioteca. */
  glyph?: string
  /** Sobrescrita curta, como "Ch", para fontes sem suporte ao glifo desejado. */
  shortLabel?: string
  longitude: number
  kind?: CelestialBodyKind
  house?: HouseNumber
  retrograde?: boolean
  aspectEnabled?: boolean
  role?: TRole
  color?: string
}

export interface AstrologicalAspect {
  sourceId: string
  targetId: string
  type: AspectType
  orb?: number
  /** Campo legado do mapa natal. Prefira `motion` em novos dados. */
  applying?: boolean
  motion?: AspectMotion
  perfection?: boolean
}

export interface AstrologicalChartData<
  TBody extends AstrologicalChartBody = AstrologicalChartBody,
  TAspect extends AstrologicalAspect = AstrologicalAspect
> {
  angles: AstrologicalChartAngles
  houses: AstrologicalHouseCusp[]
  bodies: TBody[]
  aspects?: TAspect[]
}

/** Tipos do mapa natal. */
export type NatalAspectType = AspectType
export type NatalChartAngles = AstrologicalChartAngles
export type NatalHouseCusp = AstrologicalHouseCusp
export type NatalChartBody = AstrologicalChartBody<never>
export type NatalAspect = AstrologicalAspect
export type NatalChartData = AstrologicalChartData<NatalChartBody, NatalAspect>

/** Extensões específicas da astrologia horária. */
export type HoraryBodyKind = CelestialBodyKind
export type HoraryBodyRole = 'querent' | 'quesited' | 'moon' | 'ruler' | 'witness'
export type HoraryAspectType = AspectType
export type HoraryAspectMotion = AspectMotion
export type HoraryAnswerTone = 'positive' | 'negative' | 'mixed' | 'unclear'

export type HoraryChartAngles = AstrologicalChartAngles
export type HoraryHouseCusp = AstrologicalHouseCusp
export type HoraryChartBody = AstrologicalChartBody<HoraryBodyRole>
export type HoraryAspect = AstrologicalAspect

export interface HoraryReadingSignificator {
  role: string
  bodyId: string
  note: string
}

export interface HoraryReadingTestimony {
  title: string
  tone: HoraryAnswerTone
  description: string
}

export interface HoraryReading {
  answerLabel: string
  answerTone: HoraryAnswerTone
  summary: string
  significators: HoraryReadingSignificator[]
  testimonies: HoraryReadingTestimony[]
}

export interface HoraryChartData extends AstrologicalChartData<HoraryChartBody, HoraryAspect> {
  question: string
  topicLabel?: string
  askedAtLabel: string
  locationLabel: string
  houseSystemLabel?: string
  reading?: HoraryReading
}
