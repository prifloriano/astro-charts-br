/**
 * Demo calculada para 29/09/1988, 10:36, Curitiba/PR.
 *
 * Em 29/09/1988 Curitiba estava em UTC-3, portanto o instante universal
 * correspondente é 1988-09-29T13:36:00Z.
 *
 * As posições equatoriais foram geradas com Astronomy Engine e permanecem
 * apenas na demo. O pacote publicado não depende do motor de efemérides.
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
  subtitle: 'Linhas planetárias angulares ao redor do mundo',
  momentUtc: '1988-09-29T13:36:00.000Z',
  localDateTimeLabel: '29/09/1988, 10:36',
  timezoneLabel: 'Curitiba · UTC−3',
  birthplace: {
    name: 'Curitiba, PR',
    latitude: -25.43,
    longitude: -49.270833
  },
  lines: buildAstrocartographyLines(astrocartographyEquatorialPositions, 14.1687401324)
}
