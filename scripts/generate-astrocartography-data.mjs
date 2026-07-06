import { readFile, writeFile } from 'node:fs/promises'
import * as Astronomy from 'astronomy-engine'
import { geoEquirectangular, geoPath } from 'd3-geo'
import { feature, mesh } from 'topojson-client'

const projectRoot = new URL('../', import.meta.url)
const atlasPath = new URL('./node_modules/world-atlas/countries-110m.json', projectRoot)
const worldOutput = new URL('./src/core/astrocartography/worldMap.ts', projectRoot)
const sampleOutput = new URL('./src/demo/astrocartographySample.ts', projectRoot)

const atlas = JSON.parse(await readFile(atlasPath, 'utf8'))
const land = feature(atlas, atlas.objects.land)
const borders = mesh(atlas, atlas.objects.countries, (a, b) => a !== b)
const projection = geoEquirectangular().fitSize([960, 480], /** @type {any} */ ({ type: 'Sphere' }))
const path = geoPath(projection)
const landPath = path(land)
const borderPath = path(borders)

if (!landPath || !borderPath) {
  throw new Error('Não foi possível projetar os dados do mapa-múndi.')
}

const worldSource = `/**
 * Arquivo gerado por scripts/generate-astrocartography-data.mjs.
 * Fonte cartográfica: Natural Earth 1:110m, distribuída por world-atlas.
 */
export const WORLD_LAND_PATH: string = ${JSON.stringify(landPath)}
export const WORLD_BORDER_PATH: string = ${JSON.stringify(borderPath)}
export const WORLD_MAP_ATTRIBUTION: string = 'Natural Earth · world-atlas'
`

await writeFile(worldOutput, worldSource)

const moment = new Date('1988-09-29T13:36:00.000Z')
const rotation = Astronomy.Rotation_EQJ_EQD(moment)
const greenwichSiderealHours = Astronomy.SiderealTime(moment)

const bodies = [
  ['sun', 'Sol', Astronomy.Body.Sun],
  ['moon', 'Lua', Astronomy.Body.Moon],
  ['mercury', 'Mercúrio', Astronomy.Body.Mercury],
  ['venus', 'Vênus', Astronomy.Body.Venus],
  ['mars', 'Marte', Astronomy.Body.Mars],
  ['jupiter', 'Júpiter', Astronomy.Body.Jupiter],
  ['saturn', 'Saturno', Astronomy.Body.Saturn],
  ['uranus', 'Urano', Astronomy.Body.Uranus],
  ['neptune', 'Netuno', Astronomy.Body.Neptune],
  ['pluto', 'Plutão', Astronomy.Body.Pluto]
]

const positions = bodies.map(([planet, name, body]) => {
  const geocentricVector = Astronomy.GeoVector(body, moment, true)
  const vectorOfDate = Astronomy.RotateVector(rotation, geocentricVector)
  const equatorial = Astronomy.EquatorFromVector(vectorOfDate)

  return {
    planet,
    name,
    symbol: planet,
    rightAscensionHours: Number(equatorial.ra.toFixed(8)),
    declinationDegrees: Number(equatorial.dec.toFixed(8))
  }
})

const sampleSource = `/**
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

export const astrocartographyEquatorialPositions: AstrocartographyEquatorialPosition[] = ${JSON.stringify(positions, null, 2)}

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
  lines: buildAstrocartographyLines(
    astrocartographyEquatorialPositions,
    ${Number(greenwichSiderealHours.toFixed(10))}
  )
}
`

await writeFile(sampleOutput, sampleSource)

console.log(
  JSON.stringify(
    {
      momentUtc: moment.toISOString(),
      greenwichSiderealHours,
      positions
    },
    null,
    2
  )
)
