import type {
  AstrocartographyAngle,
  AstrocartographyCoordinate,
  AstrocartographyEquatorialPosition,
  AstrocartographyLine,
  AstrocartographyPlanetId
} from './types'

const PLANET_COLORS: Readonly<Record<AstrocartographyPlanetId, string>> = {
  sun: '#d89d24',
  moon: '#7d8fd4',
  mercury: '#3d9c79',
  venus: '#62a74d',
  mars: '#d94c52',
  jupiter: '#7b5ab8',
  saturn: '#4a4654',
  uranus: '#32a5ae',
  neptune: '#436fc4',
  pluto: '#24202c'
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180
}

function toDegrees(value: number): number {
  return (value * 180) / Math.PI
}

function normalizeLongitude(value: number): number {
  return ((((value + 180) % 360) + 360) % 360) - 180
}

function verticalSegments(longitude: number): AstrocartographyCoordinate[][] {
  return [
    [
      { latitude: -89, longitude },
      { latitude: 89, longitude }
    ]
  ]
}

function horizonSegments(
  rightAscensionDegrees: number,
  declinationDegrees: number,
  greenwichSiderealDegrees: number,
  angle: 'ASC' | 'DSC'
): AstrocartographyCoordinate[][] {
  const segments: AstrocartographyCoordinate[][] = []
  let current: AstrocartographyCoordinate[] = []
  let previousLongitude: number | undefined
  const declination = toRadians(declinationDegrees)

  for (let latitude = -89; latitude <= 89; latitude += 1) {
    const latitudeRadians = toRadians(latitude)
    const cosineHourAngle = -Math.tan(latitudeRadians) * Math.tan(declination)

    if (Math.abs(cosineHourAngle) > 1) {
      if (current.length > 1) segments.push(current)
      current = []
      previousLongitude = undefined
      continue
    }

    const absoluteHourAngle = toDegrees(Math.acos(cosineHourAngle))
    const hourAngle = angle === 'ASC' ? -absoluteHourAngle : absoluteHourAngle
    const longitude = normalizeLongitude(
      rightAscensionDegrees + hourAngle - greenwichSiderealDegrees
    )

    if (previousLongitude !== undefined && Math.abs(longitude - previousLongitude) > 180) {
      if (current.length > 1) segments.push(current)
      current = []
    }

    current.push({ latitude, longitude })
    previousLongitude = longitude
  }

  if (current.length > 1) segments.push(current)
  return segments
}

function lineForAngle(
  position: AstrocartographyEquatorialPosition,
  angle: AstrocartographyAngle,
  greenwichSiderealDegrees: number
): AstrocartographyLine {
  const rightAscensionDegrees = position.rightAscensionHours * 15
  const meridianLongitude = normalizeLongitude(rightAscensionDegrees - greenwichSiderealDegrees)

  const segments =
    angle === 'MC'
      ? verticalSegments(meridianLongitude)
      : angle === 'IC'
        ? verticalSegments(normalizeLongitude(meridianLongitude + 180))
        : horizonSegments(
            rightAscensionDegrees,
            position.declinationDegrees,
            greenwichSiderealDegrees,
            angle
          )

  return {
    id: `${position.planet}-${angle.toLowerCase()}`,
    planet: position.planet,
    planetName: position.name,
    symbol: position.symbol ?? position.planet,
    angle,
    color: position.color ?? PLANET_COLORS[position.planet],
    segments
  }
}

/**
 * Converte posições equatoriais geocêntricas em linhas astrocartográficas.
 *
 * O cálculo de efemérides não faz parte desta função: o consumidor fornece
 * ascensão reta e declinação obtidas de uma fonte astronômica confiável.
 */
export function buildAstrocartographyLines(
  positions: AstrocartographyEquatorialPosition[],
  greenwichSiderealHours: number
): AstrocartographyLine[] {
  const greenwichSiderealDegrees = greenwichSiderealHours * 15
  const angles: AstrocartographyAngle[] = ['MC', 'IC', 'ASC', 'DSC']

  return positions.flatMap((position) =>
    angles.map((angle) => lineForAngle(position, angle, greenwichSiderealDegrees))
  )
}
