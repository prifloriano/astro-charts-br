<template>
  <div
    ref="chartShell"
    class="natal-chart-shell"
    :style="{ maxWidth: `${maxWidth}px` }"
    @mouseleave="hideTooltip"
    @click="hideTooltip"
  >
    <svg
      class="natal-chart"
      viewBox="0 0 760 760"
      role="img"
      aria-label="Mandala interativa do mapa astral"
    >
      <defs>
        <radialGradient id="natal-background" cx="50%" cy="46%" r="55%">
          <stop offset="0%" stop-color="#fffef9" />
          <stop offset="68%" stop-color="#fbf8ff" />
          <stop offset="100%" stop-color="#eee7f8" />
        </radialGradient>

        <radialGradient id="natal-field" cx="50%" cy="48%" r="58%">
          <stop offset="0%" stop-color="#fbf1d5" />
          <stop offset="72%" stop-color="#f1ddb0" />
          <stop offset="100%" stop-color="#e6c985" />
        </radialGradient>

        <filter id="planet-shadow" x="-80%" y="-80%" width="260%" height="260%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2.5"
            flood-color="#2e1f47"
            flood-opacity="0.2"
          />
        </filter>
      </defs>

      <circle
        :cx="CENTER"
        :cy="CENTER"
        :r="OUTER_RADIUS + 18"
        fill="url(#natal-background)"
        class="chart-background"
      />
      <circle
        :cx="CENTER"
        :cy="CENTER"
        :r="ZODIAC_INNER_RADIUS"
        fill="url(#natal-field)"
        class="chart-field"
      />

      <!-- Faixa zodiacal de doze setores exatos -->
      <g class="zodiac-band">
        <path
          v-for="sign in zodiacSectors"
          :key="sign.id"
          :d="sign.path"
          :fill="sign.fill"
          :class="{
            'is-intercepted': sign.intercepted,
            'is-duplicated': sign.duplicated
          }"
        />
      </g>

      <circle :cx="CENTER" :cy="CENTER" :r="OUTER_RADIUS" class="ring ring-outer" />
      <circle :cx="CENTER" :cy="CENTER" :r="ZODIAC_INNER_RADIUS" class="ring ring-zodiac-inner" />
      <circle :cx="CENTER" :cy="CENTER" :r="HOUSE_INNER_RADIUS" class="ring ring-house-inner" />
      <circle :cx="CENTER" :cy="CENTER" :r="ASPECT_RADIUS" class="ring ring-aspect" />

      <!-- Marcação de graus -->
      <g v-if="showDegreeTicks" class="degree-ticks">
        <line
          v-for="tick in degreeTicks"
          :key="tick.degree"
          :x1="tick.outer.x"
          :y1="tick.outer.y"
          :x2="tick.inner.x"
          :y2="tick.inner.y"
          :class="{
            'is-five': tick.degree % 5 === 0,
            'is-ten': tick.degree % 10 === 0
          }"
        />
      </g>

      <!-- Limites e símbolos dos signos -->
      <g class="zodiac-divisions">
        <line
          v-for="sign in zodiacSectors"
          :key="`${sign.id}-division`"
          :x1="sign.boundaryOuter.x"
          :y1="sign.boundaryOuter.y"
          :x2="sign.boundaryInner.x"
          :y2="sign.boundaryInner.y"
        />
      </g>

      <g
        v-for="sign in zodiacSectors"
        :key="`${sign.id}-label`"
        class="zodiac-label"
        :class="{ 'is-intercepted': sign.intercepted }"
      >
        <title>{{ sign.name }}{{ sign.intercepted ? ' - signo interceptado' : '' }}</title>
        <circle :cx="sign.label.x" :cy="sign.label.y" r="23" class="zodiac-badge" />
        <text :x="sign.label.x" :y="sign.label.y + 8" class="zodiac-glyph">
          {{ sign.glyph }}
        </text>
      </g>

      <!-- Linhas de aspecto no núcleo -->
      <g class="aspect-lines">
        <line
          v-for="aspect in renderedAspects"
          :key="aspect.id"
          :x1="aspect.from.x"
          :y1="aspect.from.y"
          :x2="aspect.to.x"
          :y2="aspect.to.y"
          :stroke="aspect.color"
          :stroke-width="aspect.width"
          :stroke-opacity="aspect.opacity"
          :stroke-dasharray="aspect.dash"
        />
      </g>

      <!-- Casas e cúspides -->
      <g class="house-cusps">
        <line
          v-for="cusp in renderedCusps"
          :key="cusp.house"
          :x1="cusp.outer.x"
          :y1="cusp.outer.y"
          :x2="cusp.inner.x"
          :y2="cusp.inner.y"
          :class="{ 'is-axis': cusp.isAxis }"
        />
      </g>

      <g v-if="showHouseNumbers" class="house-labels">
        <g v-for="house in renderedHouses" :key="house.house">
          <circle :cx="house.point.x" :cy="house.point.y" r="13" />
          <text :x="house.point.x" :y="house.point.y + 4">
            {{ house.house }}
          </text>
        </g>
      </g>

      <g class="cusp-degrees">
        <text
          v-for="cusp in renderedCusps"
          :key="`${cusp.house}-degree`"
          :x="cusp.degreePoint.x"
          :y="cusp.degreePoint.y + 3"
        >
          {{ cusp.compactDegree }}
        </text>
      </g>

      <!-- Eixos estruturais -->
      <g class="chart-axes">
        <line
          v-for="axis in renderedAxes"
          :key="axis.id"
          :x1="CENTER"
          :y1="CENTER"
          :x2="axis.lineEnd.x"
          :y2="axis.lineEnd.y"
        />

        <g v-for="axis in renderedAxes" :key="`${axis.id}-label`">
          <circle :cx="axis.label.x" :cy="axis.label.y" r="17" />
          <text :x="axis.label.x" :y="axis.label.y + 4">
            {{ axis.labelText }}
          </text>
        </g>
      </g>

      <!-- Corpos celestes e pontos calculados -->
      <g class="celestial-bodies">
        <g
          v-for="body in renderedBodies"
          :key="body.id"
          class="celestial-body"
          :class="{ 'is-active': tooltip?.body.id === body.id }"
          :data-body-id="body.id"
          :style="bodyStyle(body)"
          tabindex="0"
          role="button"
          :aria-label="`${body.name}: ${body.fullPosition}`"
          :aria-describedby="tooltip?.body.id === body.id ? 'natal-body-tooltip' : undefined"
          @mouseenter="showTooltip(body, $event)"
          @mouseleave="hideTooltip"
          @click.stop="showTooltip(body, $event)"
          @focusin="showTooltip(body, $event)"
          @focusout="hideTooltip"
          @keydown.enter.prevent="showTooltip(body, $event)"
          @keydown.esc="hideTooltip"
        >
          <line
            :x1="body.exactOuter.x"
            :y1="body.exactOuter.y"
            :x2="body.leaderEnd.x"
            :y2="body.leaderEnd.y"
            class="body-leader"
          />
          <circle
            :cx="body.exactOuter.x"
            :cy="body.exactOuter.y"
            r="2.8"
            class="exact-degree-dot"
          />
          <circle
            :cx="body.label.x"
            :cy="body.label.y"
            :r="body.kind === 'planet' ? 15 : 13"
            class="body-disc"
          />
          <text
            :x="body.label.x"
            :y="body.label.y + 6"
            class="body-glyph"
            :class="{ 'is-text': body.displayGlyph.length > 1 }"
          >
            {{ body.displayGlyph }}
          </text>
          <text :x="body.degreeLabel.x" :y="body.degreeLabel.y + 3" class="body-degree">
            {{ body.compactDegree }}
          </text>
          <text
            v-if="body.retrograde"
            :x="body.label.x + 12"
            :y="body.label.y - 11"
            class="retrograde-mark"
          >
            ℞
          </text>
        </g>
      </g>

      <circle :cx="CENTER" :cy="CENTER" r="4" class="chart-center" />
    </svg>

    <Transition name="tooltip-fade">
      <div
        v-if="tooltip"
        class="body-tooltip"
        :class="`is-${tooltip.placement}`"
        :style="tooltipStyle"
        id="natal-body-tooltip"
        data-testid="natal-body-tooltip"
        role="tooltip"
      >
        <div class="tooltip-heading">
          <span class="tooltip-glyph" :class="{ 'is-text': tooltip.body.displayGlyph.length > 1 }">
            {{ tooltip.body.displayGlyph }}
          </span>
          <div>
            <span class="tooltip-kind">{{ kindLabel(tooltip.body.kind) }}</span>
            <strong>{{ tooltip.body.name }}</strong>
          </div>
        </div>

        <span class="tooltip-position">{{ tooltip.body.fullPosition }}</span>
        <span class="tooltip-house">Casa {{ tooltip.body.house }}</span>

        <div v-if="tooltip.body.flags.length" class="tooltip-flags">
          <span v-for="flag in tooltip.body.flags" :key="flag">{{ flag }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { resolveChartBodyGlyph } from '../core/astrology/glyphs'
import type {
  CelestialBodyKind,
  HouseNumber,
  NatalAspect,
  NatalAspectType,
  NatalChartBody,
  NatalChartData,
  NatalHouseCusp,
  ZodiacSignId
} from '../core/astrology/types'

type Point = {
  x: number
  y: number
}

type ZodiacDefinition = {
  id: ZodiacSignId
  name: string
  shortName: string
  glyph: string
  fill: string
}

type RenderedBody = NatalChartBody & {
  kind: CelestialBodyKind
  house: HouseNumber
  label: Point
  degreeLabel: Point
  exactOuter: Point
  leaderEnd: Point
  compactDegree: string
  fullPosition: string
  flags: string[]
  accent: string
  displayGlyph: string
}

type TooltipPlacement = 'above' | 'below'

type TooltipState = {
  body: RenderedBody
  x: number
  y: number
  placement: TooltipPlacement
}

type AspectDefinition = {
  type: NatalAspectType
  angle: number
  orb: number
  color: string
  dash?: string
}

const props = withDefaults(
  defineProps<{
    chart: NatalChartData
    maxWidth?: number
    showDegreeTicks?: boolean
    showHouseNumbers?: boolean
    autoAspects?: boolean
  }>(),
  {
    maxWidth: 760,
    showDegreeTicks: true,
    showHouseNumbers: true,
    autoAspects: true
  }
)

const CENTER = 380
const OUTER_RADIUS = 330
const ZODIAC_INNER_RADIUS = 278
const HOUSE_INNER_RADIUS = 188
const HOUSE_NUMBER_RADIUS = 211
const ASPECT_RADIUS = 174
const PLANET_LABEL_RADIUS = 246

const zodiac: ZodiacDefinition[] = [
  { id: 'aries', name: 'Áries', shortName: 'Áries', glyph: '♈', fill: '#edd7a1' },
  { id: 'taurus', name: 'Touro', shortName: 'Touro', glyph: '♉', fill: '#e7cc8d' },
  { id: 'gemini', name: 'Gêmeos', shortName: 'Gêmeos', glyph: '♊', fill: '#f1ddb0' },
  { id: 'cancer', name: 'Câncer', shortName: 'Câncer', glyph: '♋', fill: '#e8ce91' },
  { id: 'leo', name: 'Leão', shortName: 'Leão', glyph: '♌', fill: '#efd9a3' },
  { id: 'virgo', name: 'Virgem', shortName: 'Virgem', glyph: '♍', fill: '#e4c783' },
  { id: 'libra', name: 'Libra', shortName: 'Libra', glyph: '♎', fill: '#efdcad' },
  { id: 'scorpio', name: 'Escorpião', shortName: 'Escorpião', glyph: '♏', fill: '#e5ca8b' },
  { id: 'sagittarius', name: 'Sagitário', shortName: 'Sagitário', glyph: '♐', fill: '#efd8a0' },
  { id: 'capricorn', name: 'Capricórnio', shortName: 'Capricórnio', glyph: '♑', fill: '#e3c47d' },
  { id: 'aquarius', name: 'Aquário', shortName: 'Aquário', glyph: '♒', fill: '#efdaaa' },
  { id: 'pisces', name: 'Peixes', shortName: 'Peixes', glyph: '♓', fill: '#e6c987' }
]

const bodyColors: Record<CelestialBodyKind, string> = {
  planet: '#146b9b',
  point: '#b42362',
  asteroid: '#087f86'
}

const aspectDefinitions: AspectDefinition[] = [
  { type: 'conjunction', angle: 0, orb: 8, color: '#a16207', dash: '3 4' },
  { type: 'sextile', angle: 60, orb: 4, color: '#16836f' },
  { type: 'square', angle: 90, orb: 6, color: '#df5f45' },
  { type: 'trine', angle: 120, orb: 6, color: '#3269a8' },
  { type: 'opposition', angle: 180, orb: 8, color: '#c63b55' }
]

const chartShell = ref<HTMLElement | null>(null)
const tooltip = ref<TooltipState | null>(null)

function normalizeDegree(value: number): number {
  return ((value % 360) + 360) % 360
}

function degreeDistance(a: number, b: number): number {
  const distance = Math.abs(normalizeDegree(a) - normalizeDegree(b))
  return Math.min(distance, 360 - distance)
}

function pointAtLongitude(longitude: number, radius: number): Point {
  const relative = normalizeDegree(longitude - props.chart.angles.ascendant)
  const angle = Math.PI + (relative * Math.PI) / 180

  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER - radius * Math.sin(angle)
  }
}

function annularSectorPath(
  start: number,
  end: number,
  innerRadius: number,
  outerRadius: number
): string {
  const outerStart = pointAtLongitude(start, outerRadius)
  const outerEnd = pointAtLongitude(end, outerRadius)
  const innerEnd = pointAtLongitude(end, innerRadius)
  const innerStart = pointAtLongitude(start, innerRadius)

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 0 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 0 1 ${innerStart.x} ${innerStart.y}`,
    'Z'
  ].join(' ')
}

function zodiacParts(longitude: number): {
  signIndex: number
  degree: number
  minute: number
  second: number
} {
  const secondsInCircle = 360 * 60 * 60
  const totalSeconds = Math.round(normalizeDegree(longitude) * 60 * 60) % secondsInCircle
  const secondsInSign = 30 * 60 * 60
  const signIndex = Math.floor(totalSeconds / secondsInSign)
  const signSeconds = totalSeconds % secondsInSign
  const degree = Math.floor(signSeconds / 3600)
  const minute = Math.floor((signSeconds % 3600) / 60)
  const second = signSeconds % 60

  return { signIndex, degree, minute, second }
}

function formatCompactDegree(longitude: number): string {
  const { degree, minute } = zodiacParts(longitude)
  return `${degree}°${String(minute).padStart(2, '0')}′`
}

function formatFullPosition(longitude: number): string {
  const { signIndex, degree, minute, second } = zodiacParts(longitude)
  return `${degree}°${String(minute).padStart(2, '0')}′${String(second).padStart(2, '0')}″ de ${zodiac[signIndex].name}`
}

function flagsForBody(body: NatalChartBody): string[] {
  const { degree } = zodiacParts(body.longitude)
  const flags: string[] = []

  if (body.retrograde) flags.push('Retrógrado')
  if (degree === 29) flags.push('Grau anarético')
  if (degree === 0) flags.push('Grau crítico 0°')

  return flags
}

const sortedHouses = computed<NatalHouseCusp[]>(() => {
  return [...props.chart.houses].sort((a, b) => a.house - b.house)
})

function houseForLongitude(longitude: number): HouseNumber {
  const houses = sortedHouses.value
  if (houses.length !== 12) return 1

  for (let index = 0; index < houses.length; index += 1) {
    const current = normalizeDegree(houses[index].longitude)
    const next = normalizeDegree(houses[(index + 1) % houses.length].longitude)
    const sectorSize = normalizeDegree(next - current)
    const bodyOffset = normalizeDegree(longitude - current)

    if (bodyOffset < sectorSize) return houses[index].house
  }

  return 1
}

const cuspSignCounts = computed(() => {
  const counts = Array.from({ length: 12 }, () => 0)

  sortedHouses.value.forEach((cusp) => {
    const signIndex = Math.floor(normalizeDegree(cusp.longitude) / 30)
    counts[signIndex] += 1
  })

  return counts
})

const zodiacSectors = computed(() => {
  return zodiac.map((sign, index) => {
    const start = index * 30
    const end = start + 30

    return {
      ...sign,
      path: annularSectorPath(start, end, ZODIAC_INNER_RADIUS, OUTER_RADIUS),
      label: pointAtLongitude(start + 15, OUTER_RADIUS),
      boundaryOuter: pointAtLongitude(start, OUTER_RADIUS),
      boundaryInner: pointAtLongitude(start, ZODIAC_INNER_RADIUS),
      intercepted: cuspSignCounts.value[index] === 0,
      duplicated: cuspSignCounts.value[index] > 1
    }
  })
})

const degreeTicks = computed(() => {
  return Array.from({ length: 360 }, (_, degree) => {
    const length = degree % 10 === 0 ? 10 : degree % 5 === 0 ? 7 : 3.5

    return {
      degree,
      outer: pointAtLongitude(degree, ZODIAC_INNER_RADIUS),
      inner: pointAtLongitude(degree, ZODIAC_INNER_RADIUS - length)
    }
  })
})

const renderedCusps = computed(() => {
  return sortedHouses.value.map((cusp) => {
    const isAxis = [1, 4, 7, 10].includes(cusp.house)

    return {
      ...cusp,
      isAxis,
      outer: pointAtLongitude(cusp.longitude, ZODIAC_INNER_RADIUS),
      inner: isAxis
        ? { x: CENTER, y: CENTER }
        : pointAtLongitude(cusp.longitude, HOUSE_INNER_RADIUS),
      degreePoint: pointAtLongitude(cusp.longitude, 263),
      compactDegree: formatCompactDegree(cusp.longitude)
    }
  })
})

const renderedHouses = computed(() => {
  const houses = sortedHouses.value

  return houses.map((cusp, index) => {
    const next = houses[(index + 1) % houses.length]
    const sectorSize = normalizeDegree(next.longitude - cusp.longitude)
    const midpoint = normalizeDegree(cusp.longitude + sectorSize / 2)

    return {
      house: cusp.house,
      point: pointAtLongitude(midpoint, HOUSE_NUMBER_RADIUS)
    }
  })
})

const renderedAxes = computed(() => {
  const descendant =
    props.chart.angles.descendant ?? normalizeDegree(props.chart.angles.ascendant + 180)
  const imumCoeli =
    props.chart.angles.imumCoeli ?? normalizeDegree(props.chart.angles.midheaven + 180)

  return [
    { id: 'asc', labelText: 'ASC', longitude: props.chart.angles.ascendant },
    { id: 'dsc', labelText: 'DSC', longitude: descendant },
    { id: 'mc', labelText: 'MC', longitude: props.chart.angles.midheaven },
    { id: 'ic', labelText: 'IC', longitude: imumCoeli }
  ].map((axis) => ({
    ...axis,
    lineEnd: pointAtLongitude(axis.longitude, OUTER_RADIUS),
    label: pointAtLongitude(axis.longitude, 348)
  }))
})

const renderedBodies = computed<RenderedBody[]>(() => {
  const sorted = [...props.chart.bodies]
    .map((body) => ({
      body,
      relative: normalizeDegree(body.longitude - props.chart.angles.ascendant)
    }))
    .sort((a, b) => a.relative - b.relative)

  let previousRelative = Number.NEGATIVE_INFINITY
  let previousLane = 0

  return sorted.map(({ body, relative }) => {
    const closeToPrevious = relative - previousRelative < 7
    const lane = closeToPrevious ? (previousLane + 1) % 3 : 0
    const radiusByLane = [PLANET_LABEL_RADIUS, PLANET_LABEL_RADIUS - 22, PLANET_LABEL_RADIUS + 15]
    const labelRadius = radiusByLane[lane]
    const kind = body.kind ?? 'planet'
    const accent = body.color ?? bodyColors[kind]

    previousRelative = relative
    previousLane = lane

    return {
      ...body,
      kind,
      house: body.house ?? houseForLongitude(body.longitude),
      label: pointAtLongitude(body.longitude, labelRadius),
      degreeLabel: pointAtLongitude(body.longitude, labelRadius - 17),
      exactOuter: pointAtLongitude(body.longitude, ZODIAC_INNER_RADIUS - 3),
      leaderEnd: pointAtLongitude(body.longitude, labelRadius + 16),
      compactDegree: formatCompactDegree(body.longitude),
      fullPosition: formatFullPosition(body.longitude),
      flags: flagsForBody(body),
      accent,
      displayGlyph: resolveChartBodyGlyph(body)
    }
  })
})

function calculateAspects(bodies: NatalChartBody[]): NatalAspect[] {
  const enabledBodies = bodies.filter((body) => body.aspectEnabled !== false)
  const aspects: NatalAspect[] = []

  for (let first = 0; first < enabledBodies.length; first += 1) {
    for (let second = first + 1; second < enabledBodies.length; second += 1) {
      const source = enabledBodies[first]
      const target = enabledBodies[second]
      const distance = degreeDistance(source.longitude, target.longitude)
      const match = aspectDefinitions
        .map((definition) => ({
          definition,
          orb: Math.abs(distance - definition.angle)
        }))
        .filter(({ definition, orb }) => orb <= definition.orb)
        .sort((a, b) => a.orb - b.orb)[0]

      if (!match) continue

      aspects.push({
        sourceId: source.id,
        targetId: target.id,
        type: match.definition.type,
        orb: match.orb
      })
    }
  }

  return aspects
}

const activeAspects = computed(() => {
  if (props.chart.aspects !== undefined) return props.chart.aspects
  if (!props.autoAspects) return []
  return calculateAspects(props.chart.bodies)
})

const renderedAspects = computed(() => {
  const bodiesById = new Map(props.chart.bodies.map((body) => [body.id, body]))

  return activeAspects.value.flatMap((aspect) => {
    const source = bodiesById.get(aspect.sourceId)
    const target = bodiesById.get(aspect.targetId)
    const definition = aspectDefinitions.find((item) => item.type === aspect.type)

    if (!source || !target || !definition) return []

    const orb =
      aspect.orb ?? Math.abs(degreeDistance(source.longitude, target.longitude) - definition.angle)

    return [
      {
        id: `${aspect.sourceId}-${aspect.targetId}-${aspect.type}`,
        from: pointAtLongitude(source.longitude, ASPECT_RADIUS),
        to: pointAtLongitude(target.longitude, ASPECT_RADIUS),
        color: definition.color,
        dash: definition.dash,
        width: Math.max(1, 2.6 - orb * 0.22),
        opacity: Math.max(0.38, 0.9 - orb * 0.08)
      }
    ]
  })
})

const tooltipStyle = computed<Record<string, string>>(() => {
  if (!tooltip.value) return {} as Record<string, string>

  return {
    left: `${tooltip.value.x}px`,
    top: `${tooltip.value.y}px`,
    '--tooltip-accent': tooltip.value.body.accent
  }
})

function bodyStyle(body: RenderedBody): Record<string, string> {
  return {
    '--body-accent': body.accent
  }
}

function kindLabel(kind: CelestialBodyKind): string {
  if (kind === 'point') return 'Ponto calculado'
  if (kind === 'asteroid') return 'Asteroide'
  return 'Corpo celeste'
}

function showTooltip(body: RenderedBody, event: MouseEvent | FocusEvent | KeyboardEvent): void {
  const shell = chartShell.value
  const target = event.currentTarget as SVGGElement | null

  if (!shell || !target) return

  const shellRect = shell.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const tooltipHalfWidth = 112
  const centerX = targetRect.left + targetRect.width / 2 - shellRect.left
  const top = targetRect.top - shellRect.top
  const bottom = targetRect.bottom - shellRect.top
  const placement: TooltipPlacement = top > 128 ? 'above' : 'below'

  tooltip.value = {
    body,
    x: Math.min(Math.max(centerX, tooltipHalfWidth), shellRect.width - tooltipHalfWidth),
    y: placement === 'above' ? top - 12 : bottom + 12,
    placement
  }
}

function hideTooltip(): void {
  tooltip.value = null
}
</script>

<style scoped>
.natal-chart-shell {
  position: relative;
  isolation: isolate;
  width: 100%;
}

.natal-chart {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  color: #3b2d50;
}

.chart-background {
  stroke: #d8cde7;
  stroke-width: 1;
}

.chart-field {
  stroke: #9a7942;
  stroke-width: 0.8;
}

.zodiac-band path {
  stroke: #fff4d7;
  stroke-width: 0.7;
  transition: filter 160ms ease;
}

.zodiac-band path.is-intercepted {
  stroke: #b42371;
  stroke-width: 1.6;
  stroke-dasharray: 5 4;
}

.zodiac-band path.is-duplicated {
  filter: saturate(1.2);
}

.ring {
  fill: none;
  stroke: #49385f;
}

.ring-outer {
  stroke-width: 2.2;
}

.ring-zodiac-inner {
  stroke-width: 1.6;
}

.ring-house-inner {
  stroke: #8a789e;
  stroke-width: 1;
}

.ring-aspect {
  stroke: #b9adc7;
  stroke-width: 0.8;
  stroke-dasharray: 2 4;
}

.degree-ticks line {
  stroke: #75658a;
  stroke-width: 0.45;
  opacity: 0.65;
}

.degree-ticks line.is-five {
  stroke-width: 0.8;
  opacity: 0.8;
}

.degree-ticks line.is-ten {
  stroke-width: 1;
  opacity: 1;
}

.zodiac-divisions line {
  stroke: #49385f;
  stroke-width: 1.2;
}

.zodiac-label text {
  text-anchor: middle;
  pointer-events: none;
}

.zodiac-badge {
  fill: #0798b6;
  stroke: #d8f8ff;
  stroke-width: 2;
  filter: url(#planet-shadow);
}

.zodiac-glyph {
  font:
    25px/1 'Apple Symbols',
    'Noto Sans Symbols 2',
    'Segoe UI Symbol',
    'Arial Unicode MS',
    serif;
  fill: #ffffff;
}

.zodiac-label.is-intercepted .zodiac-glyph {
  fill: #ffe3f1;
}

.zodiac-label.is-intercepted .zodiac-badge {
  fill: #a21e68;
  stroke-dasharray: 4 3;
}

.aspect-lines line {
  vector-effect: non-scaling-stroke;
}

.house-cusps line {
  stroke: #77668e;
  stroke-width: 1;
}

.house-cusps line.is-axis {
  stroke: #3d2855;
  stroke-width: 1.8;
}

.house-labels circle {
  fill: #fffdf7;
  stroke: #8c79a2;
  stroke-width: 1;
}

.house-labels text {
  text-anchor: middle;
  font:
    700 11px/1 Arial,
    Helvetica,
    sans-serif;
  fill: #49385f;
}

.cusp-degrees text {
  text-anchor: middle;
  font:
    600 6.5px/1 Arial,
    Helvetica,
    sans-serif;
  fill: #766887;
  paint-order: stroke fill;
  stroke: #fbf8ff;
  stroke-width: 2px;
}

.chart-axes line {
  stroke: #382449;
  stroke-width: 1.7;
}

.chart-axes circle {
  fill: #49305f;
  stroke: #fffaf4;
  stroke-width: 2;
  filter: url(#planet-shadow);
}

.chart-axes text {
  text-anchor: middle;
  font:
    800 9px/1 Arial,
    Helvetica,
    sans-serif;
  letter-spacing: 0.3px;
  fill: #fffaf4;
}

.celestial-body {
  --body-accent: #6d28d9;

  cursor: pointer;
  outline: none;
}

.body-leader {
  stroke: var(--body-accent);
  stroke-width: 0.9;
  stroke-opacity: 0.6;
  transition: stroke-width 160ms ease;
}

.exact-degree-dot {
  fill: var(--body-accent);
}

.body-disc {
  fill: var(--body-accent);
  stroke: #fff8e9;
  stroke-width: 1.8;
  filter: url(#planet-shadow);
  transform-box: fill-box;
  transform-origin: center;
  transition:
    fill 160ms ease,
    transform 160ms ease,
    filter 160ms ease;
}

.body-glyph {
  text-anchor: middle;
  font:
    21px/1 'Apple Symbols',
    'Noto Sans Symbols 2',
    'Segoe UI Symbol',
    'Arial Unicode MS',
    serif;
  fill: #ffffff;
  pointer-events: none;
}

.body-glyph.is-text {
  font:
    800 10px/1 Arial,
    Helvetica,
    sans-serif;
  letter-spacing: -0.2px;
}

.body-degree {
  text-anchor: middle;
  font:
    700 7px/1 Arial,
    Helvetica,
    sans-serif;
  fill: #594768;
  paint-order: stroke fill;
  stroke: #fbf8ff;
  stroke-width: 2.5px;
  pointer-events: none;
}

.retrograde-mark {
  text-anchor: middle;
  font:
    800 9px/1 Georgia,
    serif;
  fill: #b42371;
  paint-order: stroke fill;
  stroke: #fffdf8;
  stroke-width: 2px;
  pointer-events: none;
}

.celestial-body:hover .body-disc,
.celestial-body:focus-visible .body-disc,
.celestial-body.is-active .body-disc {
  fill: color-mix(in srgb, var(--body-accent) 78%, #ffffff);
  stroke: #ffffff;
  transform: scale(1.16);
  filter: url(#planet-shadow)
    drop-shadow(0 0 7px color-mix(in srgb, var(--body-accent) 55%, transparent));
}

.celestial-body:hover .body-leader,
.celestial-body:focus-visible .body-leader,
.celestial-body.is-active .body-leader {
  stroke-width: 1.8;
  stroke-opacity: 1;
}

.chart-center {
  fill: #4b355e;
  stroke: #fffaf4;
  stroke-width: 1.5;
}

.body-tooltip {
  --tooltip-accent: #6d28d9;

  position: absolute;
  z-index: 10;
  width: 224px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 13px 15px 14px;
  border: 1px solid var(--tooltip-accent);
  border-radius: 16px;
  color: #fffaf5;
  background: linear-gradient(135deg, rgb(36 20 52 / 98%), rgb(78 40 101 / 97%));
  box-shadow:
    0 18px 40px rgb(42 23 61 / 28%),
    0 0 20px color-mix(in srgb, var(--tooltip-accent) 28%, transparent);
  pointer-events: none;
}

.body-tooltip.is-above {
  transform: translate(-50%, -100%);
}

.body-tooltip.is-below {
  transform: translate(-50%, 0);
}

.body-tooltip::after {
  content: '';
  position: absolute;
  left: 50%;
  width: 10px;
  height: 10px;
  border: solid var(--tooltip-accent);
  background: #4a275f;
  transform: translateX(-50%) rotate(45deg);
}

.body-tooltip.is-above::after {
  bottom: -6px;
  border-width: 0 1px 1px 0;
}

.body-tooltip.is-below::after {
  top: -6px;
  border-width: 1px 0 0 1px;
}

.tooltip-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tooltip-heading > div {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.tooltip-glyph {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--tooltip-accent);
  border-radius: 50%;
  font:
    23px/1 'Apple Symbols',
    'Noto Sans Symbols 2',
    'Segoe UI Symbol',
    serif;
  color: var(--tooltip-accent);
  background: rgb(255 255 255 / 8%);
}

.tooltip-glyph.is-text {
  font:
    800 11px/1 Arial,
    Helvetica,
    sans-serif;
  letter-spacing: -0.2px;
}

.tooltip-kind {
  font:
    700 9px/1.2 Arial,
    Helvetica,
    sans-serif;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--tooltip-accent);
}

.tooltip-heading strong {
  font:
    700 18px/1.2 Georgia,
    'Times New Roman',
    serif;
}

.tooltip-position,
.tooltip-house {
  font:
    600 11px/1.35 Arial,
    Helvetica,
    sans-serif;
  color: #eee6f5;
}

.tooltip-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tooltip-flags span {
  padding: 3px 7px;
  border-radius: 999px;
  font:
    700 9px/1.2 Arial,
    Helvetica,
    sans-serif;
  color: #2b173b;
  background: var(--tooltip-accent);
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition:
    opacity 140ms ease,
    transform 140ms ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}

.tooltip-fade-enter-from.is-above,
.tooltip-fade-leave-to.is-above {
  transform: translate(-50%, calc(-100% + 5px));
}

.tooltip-fade-enter-from.is-below,
.tooltip-fade-leave-to.is-below {
  transform: translate(-50%, -5px);
}

@media (prefers-reduced-motion: reduce) {
  .body-disc,
  .body-leader,
  .tooltip-fade-enter-active,
  .tooltip-fade-leave-active {
    transition: none;
  }
}
</style>
