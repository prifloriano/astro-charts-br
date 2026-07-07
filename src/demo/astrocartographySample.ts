/**
 * Demo visual com metadados fictícios de data, hora e local.
 *
 * As posições equatoriais permanecem apenas como fixture para renderização.
 * Não use estes dados para interpretação astrológica real. O pacote publicado
 * não depende de motor de efemérides em runtime.
 */
import { buildAstrocartographyLines } from '../core/astrocartography/lines'
import type {
  AstrocartographyChartData,
  AstrocartographyEquatorialPosition
} from '../core/astrocartography/types'

export const astrocartographyEquatorialPositions: AstrocartographyEquatorialPosition[] = [
  {
    planet: 'sun',
    name: 'Sol',
    symbol: 'sun',
    rightAscensionHours: 12.40528196,
    declinationDegrees: -2.62942264
  },
  {
    planet: 'moon',
    name: 'Lua',
    symbol: 'moon',
    rightAscensionHours: 3.64718791,
    declinationDegrees: 24.68584401
  },
  {
    planet: 'mercury',
    name: 'Mercúrio',
    symbol: 'mercury',
    rightAscensionHours: 13.58051828,
    declinationDegrees: -13.8776821
  },
  {
    planet: 'venus',
    name: 'Vênus',
    symbol: 'venus',
    rightAscensionHours: 9.77142921,
    declinationDegrees: 13.36003244
  },
  {
    planet: 'mars',
    name: 'Marte',
    symbol: 'mars',
    rightAscensionHours: 0.4128329,
    declinationDegrees: -2.19538851
  },
  {
    planet: 'jupiter',
    name: 'Júpiter',
    symbol: 'jupiter',
    rightAscensionHours: 4.29308027,
    declinationDegrees: 20.31532764
  },
  {
    planet: 'saturn',
    name: 'Saturno',
    symbol: 'saturn',
    rightAscensionHours: 17.75915455,
    declinationDegrees: -22.50692104
  },
  {
    planet: 'uranus',
    name: 'Urano',
    symbol: 'uranus',
    rightAscensionHours: 17.80286865,
    declinationDegrees: -23.63086722
  },
  {
    planet: 'neptune',
    name: 'Netuno',
    symbol: 'neptune',
    rightAscensionHours: 18.53695238,
    declinationDegrees: -22.28644206
  },
  {
    planet: 'pluto',
    name: 'Plutão',
    symbol: 'pluto',
    rightAscensionHours: 14.89708068,
    declinationDegrees: -0.37260902
  }
]

export const astrocartographySample: AstrocartographyChartData = {
  title: 'Astrocartografia natal',
  subtitle: 'Exemplo fictício de linhas planetárias angulares',
  momentUtc: '2001-05-17T17:28:00.000Z',
  localDateTimeLabel: '17/05/2001, 14:28',
  timezoneLabel: 'Cidade Fictícia · UTC−3',
  birthplace: {
    name: 'Cidade Fictícia, BR',
    latitude: -15.7312,
    longitude: -47.9123
  },
  lines: buildAstrocartographyLines(astrocartographyEquatorialPositions, 14.1687401324)
}
