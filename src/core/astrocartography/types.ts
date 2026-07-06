import type { AstrologicalSymbolId } from '../astrology/types'

export type AstrocartographyAngle = 'ASC' | 'DSC' | 'MC' | 'IC'

export type AstrocartographyPlanetId =
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

export interface AstrocartographyCoordinate {
  /** Latitude geográfica em graus, entre -90 e +90. */
  latitude: number
  /** Longitude geográfica em graus, entre -180 e +180. */
  longitude: number
}

export interface AstrocartographyBirthplace extends AstrocartographyCoordinate {
  name: string
}

export interface AstrocartographyEquatorialPosition {
  planet: AstrocartographyPlanetId
  name: string
  symbol?: AstrologicalSymbolId
  /** Ascensão reta geocêntrica em horas siderais, entre 0 e 24. */
  rightAscensionHours: number
  /** Declinação geocêntrica em graus, entre -90 e +90. */
  declinationDegrees: number
  color?: string
}

export interface AstrocartographyLine {
  id: string
  planet: AstrocartographyPlanetId
  planetName: string
  symbol?: AstrologicalSymbolId
  angle: AstrocartographyAngle
  color: string
  /**
   * Segmentos separados evitam linhas atravessando o mapa quando uma curva
   * cruza o antimeridiano de 180°.
   */
  segments: AstrocartographyCoordinate[][]
}

export interface AstrocartographyChartData {
  title?: string
  subtitle?: string
  momentUtc: string
  localDateTimeLabel?: string
  timezoneLabel?: string
  birthplace?: AstrocartographyBirthplace
  lines: AstrocartographyLine[]
}

export interface AstrocartographyLineEvent {
  line: AstrocartographyLine
  anchor: AstrocartographyCoordinate
}
