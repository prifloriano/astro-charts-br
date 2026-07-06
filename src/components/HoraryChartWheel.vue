<template>
  <section
    ref="chartShell"
    class="horary-shell"
    :style="{ maxWidth: `${maxWidth}px` }"
    @mouseleave="hideTooltip"
    @click="hideTooltip"
  >
    <header class="horary-header">
      <span class="eyebrow">Mapa horário</span>
      <h2>{{ chart.question }}</h2>

      <div class="meta-row">
        <span>{{ chart.askedAtLabel }}</span>
        <span>{{ chart.locationLabel }}</span>
        <span v-if="chart.houseSystemLabel">{{ chart.houseSystemLabel }}</span>
        <span v-if="chart.topicLabel">{{ chart.topicLabel }}</span>
      </div>
    </header>

    <div class="horary-grid">
      <div class="wheel-card">
        <svg
          class="horary-chart"
          viewBox="0 0 720 720"
          role="img"
          aria-label="Mandala do mapa horário"
        >
          <defs>
            <radialGradient id="horary-sky" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stop-color="#faf7ff" />
              <stop offset="58%" stop-color="#d5c5ec" />
              <stop offset="100%" stop-color="#211036" />
            </radialGradient>

            <radialGradient id="horary-field" cx="50%" cy="48%" r="58%">
              <stop offset="0%" stop-color="#fdfcff" />
              <stop offset="70%" stop-color="#eee8f8" />
              <stop offset="100%" stop-color="#cdbfe2" />
            </radialGradient>

            <filter id="horary-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                flood-color="#271135"
                flood-opacity="0.28"
              />
            </filter>
          </defs>

          <circle
            :cx="CENTER"
            :cy="CENTER"
            :r="OUTER_RADIUS + 28"
            fill="url(#horary-sky)"
            class="sky-circle"
          />

          <circle
            :cx="CENTER"
            :cy="CENTER"
            :r="ZODIAC_INNER_RADIUS"
            fill="url(#horary-field)"
            class="field-circle"
          />

          <g class="zodiac-band">
            <path v-for="sign in zodiacSectors" :key="sign.id" :d="sign.path" :fill="sign.fill" />
          </g>

          <circle :cx="CENTER" :cy="CENTER" :r="OUTER_RADIUS" class="ring outer-ring" />
          <circle
            :cx="CENTER"
            :cy="CENTER"
            :r="ZODIAC_INNER_RADIUS"
            class="ring zodiac-inner-ring"
          />
          <circle :cx="CENTER" :cy="CENTER" :r="HOUSE_INNER_RADIUS" class="ring house-inner-ring" />
          <circle :cx="CENTER" :cy="CENTER" :r="ASPECT_RADIUS" class="ring aspect-ring" />

          <g class="degree-ticks">
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

          <g v-for="sign in zodiacSectors" :key="`${sign.id}-label`" class="zodiac-label">
            <circle :cx="sign.label.x" :cy="sign.label.y" r="22" />
            <text :x="sign.label.x" :y="sign.label.y + 8">
              {{ sign.glyph }}
            </text>
          </g>

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
              :class="[
                aspect.motion ? `is-${aspect.motion}` : '',
                aspect.perfection ? 'is-perfection' : ''
              ]"
            />
          </g>

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

          <g class="house-labels">
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

          <g class="axes">
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

          <g class="bodies">
            <g
              v-for="body in renderedBodies"
              :key="body.id"
              class="body"
              :class="[
                `is-${body.kind}`,
                body.role ? `role-${body.role}` : '',
                body.id === 'moon' ? 'is-moon' : '',
                tooltip?.body.id === body.id ? 'is-active' : ''
              ]"
              :style="bodyCss(body)"
              :data-body-id="body.id"
              tabindex="0"
              role="button"
              :aria-label="`${body.name}: ${body.fullPosition}, casa ${body.house}`"
              :aria-describedby="tooltip?.body.id === body.id ? 'horary-body-tooltip' : undefined"
              @mouseenter="showTooltip(body, $event)"
              @mouseleave="hideTooltip"
              @click.stop="showTooltip(body, $event)"
              @focusin="showTooltip(body, $event)"
              @focusout="hideTooltip"
              @keydown.enter.prevent="showTooltip(body, $event)"
              @keydown.esc="hideTooltip"
            >
              <line
                :x1="body.exact.x"
                :y1="body.exact.y"
                :x2="body.leaderEnd.x"
                :y2="body.leaderEnd.y"
                class="body-leader"
              />

              <circle :cx="body.exact.x" :cy="body.exact.y" r="2.8" class="exact-dot" />

              <circle
                :cx="body.label.x"
                :cy="body.label.y"
                :r="body.kind === 'planet' ? 16 : 13"
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
                :x="body.label.x + 13"
                :y="body.label.y - 12"
                class="retrograde"
              >
                ℞
              </text>
            </g>
          </g>

          <circle :cx="CENTER" :cy="CENTER" r="4" class="center-dot" />
          <text :x="CENTER" :y="CENTER - 13" class="center-mark">✦</text>
        </svg>

        <div v-if="roleBodies.length" class="role-chips">
          <span v-for="body in roleBodies" :key="`role-${body.id}`">
            <strong>{{ roleLabel(body.role, body.id) }}</strong>
            {{ body.name }}
          </span>
        </div>
      </div>

      <aside v-if="chart.reading" class="reading-panel">
        <span class="reading-eyebrow">Leitura sintética</span>

        <div class="answer" :class="`tone-${chart.reading.answerTone}`">
          {{ chart.reading.answerLabel }}
        </div>

        <p class="summary">
          {{ chart.reading.summary }}
        </p>

        <section class="reading-section">
          <h3>Significadores</h3>

          <article
            v-for="item in chart.reading.significators"
            :key="`${item.role}-${item.bodyId}`"
            class="significator-card"
          >
            <span>{{ item.role }}</span>
            <strong>{{ bodyName(item.bodyId) }}</strong>
            <p>{{ item.note }}</p>
          </article>
        </section>

        <section class="reading-section">
          <h3>Testemunhos</h3>

          <article
            v-for="item in chart.reading.testimonies"
            :key="item.title"
            class="testimony-card"
            :class="`tone-${item.tone}`"
          >
            <strong>{{ item.title }}</strong>
            <p>{{ item.description }}</p>
          </article>
        </section>
      </aside>
    </div>

    <Transition name="tooltip-fade">
      <div
        v-if="tooltip"
        class="horary-tooltip"
        :class="`is-${tooltip.placement}`"
        :style="tooltipStyle"
        id="horary-body-tooltip"
        data-testid="horary-body-tooltip"
        role="tooltip"
      >
        <div class="tooltip-heading">
          <span class="tooltip-glyph" :class="{ 'is-text': tooltip.body.displayGlyph.length > 1 }">
            {{ tooltip.body.displayGlyph }}
          </span>

          <div>
            <span class="tooltip-kind">
              {{ tooltipRoleLabel(tooltip.body) }}
            </span>
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
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { resolveChartBodyGlyph } from '../core/astrology/glyphs'
import type {
  HoraryAspectType,
  HoraryBodyKind,
  HoraryBodyRole,
  HoraryChartBody,
  HoraryChartData,
  HoraryHouseCusp,
  HouseNumber,
  ZodiacSignId
} from '../core/astrology/types'

type Point = {
  x: number
  y: number
}

type ZodiacDefinition = {
  id: ZodiacSignId
  name: string
  glyph: string
  fill: string
}

type RenderedBody = HoraryChartBody & {
  kind: HoraryBodyKind
  house: HouseNumber
  label: Point
  degreeLabel: Point
  exact: Point
  leaderEnd: Point
  compactDegree: string
  fullPosition: string
  accent: string
  displayGlyph: string
  flags: string[]
}

type TooltipPlacement = 'above' | 'below'

type TooltipState = {
  body: RenderedBody
  x: number
  y: number
  placement: TooltipPlacement
}

type AspectMeta = {
  label: string
  color: string
  dash?: string
}

const props = withDefaults(
  defineProps<{
    chart: HoraryChartData
    maxWidth?: number
  }>(),
  {
    maxWidth: 1120
  }
)

const CENTER = 360
const OUTER_RADIUS = 304
const ZODIAC_INNER_RADIUS = 252
const HOUSE_INNER_RADIUS = 168
const HOUSE_NUMBER_RADIUS = 194
const ASPECT_RADIUS = 150
const BODY_LABEL_RADIUS = 224

const chartShell = ref<HTMLElement | null>(null)
const tooltip = ref<TooltipState | null>(null)

const zodiac: ZodiacDefinition[] = [
  { id: 'aries', name: 'Áries', glyph: '♈', fill: '#d8b7dd' },
  { id: 'taurus', name: 'Touro', glyph: '♉', fill: '#b9cce2' },
  { id: 'gemini', name: 'Gêmeos', glyph: '♊', fill: '#c8b8e5' },
  { id: 'cancer', name: 'Câncer', glyph: '♋', fill: '#b8d2dc' },
  { id: 'leo', name: 'Leão', glyph: '♌', fill: '#dab6d0' },
  { id: 'virgo', name: 'Virgem', glyph: '♍', fill: '#c8c3e0' },
  { id: 'libra', name: 'Libra', glyph: '♎', fill: '#c3d7e9' },
  { id: 'scorpio', name: 'Escorpião', glyph: '♏', fill: '#cab2da' },
  { id: 'sagittarius', name: 'Sagitário', glyph: '♐', fill: '#bac7e4' },
  { id: 'capricorn', name: 'Capricórnio', glyph: '♑', fill: '#d1bbdf' },
  { id: 'aquarius', name: 'Aquário', glyph: '♒', fill: '#b6d2de' },
  { id: 'pisces', name: 'Peixes', glyph: '♓', fill: '#c6bbe3' }
]

const bodyColors: Record<HoraryBodyKind, string> = {
  planet: '#246f9f',
  point: '#b4266b',
  asteroid: '#0f827d'
}

const roleColors: Record<HoraryBodyRole, string> = {
  querent: '#8b5cf6',
  quesited: '#d6a84f',
  moon: '#4f9fcf',
  ruler: '#c026d3',
  witness: '#0f9f8f'
}

const roleTexts: Record<HoraryBodyRole, string> = {
  querent: 'Consulente',
  quesited: 'Assunto',
  moon: 'Lua',
  ruler: 'Regente',
  witness: 'Testemunha'
}

const aspectMeta: Record<HoraryAspectType, AspectMeta> = {
  conjunction: { label: 'Conjunção', color: '#d6a84f', dash: '3 4' },
  sextile: { label: 'Sêxtil', color: '#16836f' },
  square: { label: 'Quadratura', color: '#df5f45' },
  trine: { label: 'Trígono', color: '#3269a8' },
  opposition: { label: 'Oposição', color: '#c63b55' }
}

function normalizeDegree(value: number): number {
  return ((value % 360) + 360) % 360
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

function flagsForBody(body: HoraryChartBody): string[] {
  const { degree } = zodiacParts(body.longitude)
  const flags: string[] = []

  if (body.retrograde) flags.push('Retrógrado')
  if (degree === 29) flags.push('Grau anarético')
  if (degree === 0) flags.push('Grau crítico 0°')
  if (body.role) flags.push(roleTexts[body.role])

  return flags
}

const sortedHouses = computed<HoraryHouseCusp[]>(() => {
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

const zodiacSectors = computed(() => {
  return zodiac.map((sign, index) => {
    const start = index * 30
    const end = start + 30

    return {
      ...sign,
      path: annularSectorPath(start, end, ZODIAC_INNER_RADIUS, OUTER_RADIUS),
      label: pointAtLongitude(start + 15, OUTER_RADIUS + 17),
      boundaryOuter: pointAtLongitude(start, OUTER_RADIUS),
      boundaryInner: pointAtLongitude(start, ZODIAC_INNER_RADIUS)
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
      degreePoint: pointAtLongitude(cusp.longitude, ZODIAC_INNER_RADIUS - 17),
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
    label: pointAtLongitude(axis.longitude, OUTER_RADIUS + 38)
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
    const kind = body.kind ?? 'planet'
    const closeToPrevious = relative - previousRelative < 7
    const lane = closeToPrevious ? (previousLane + 1) % 3 : 0
    const radiusByLane = [BODY_LABEL_RADIUS, BODY_LABEL_RADIUS - 21, BODY_LABEL_RADIUS + 15]
    const labelRadius = radiusByLane[lane]
    const roleAccent = body.role ? roleColors[body.role] : undefined
    const accent = body.color ?? roleAccent ?? bodyColors[kind]

    previousRelative = relative
    previousLane = lane

    return {
      ...body,
      kind,
      house: body.house ?? houseForLongitude(body.longitude),
      label: pointAtLongitude(body.longitude, labelRadius),
      degreeLabel: pointAtLongitude(body.longitude, labelRadius - 17),
      exact: pointAtLongitude(body.longitude, ZODIAC_INNER_RADIUS - 4),
      leaderEnd: pointAtLongitude(body.longitude, labelRadius + 15),
      compactDegree: formatCompactDegree(body.longitude),
      fullPosition: formatFullPosition(body.longitude),
      accent,
      displayGlyph: resolveChartBodyGlyph(body),
      flags: flagsForBody(body)
    }
  })
})

const renderedAspects = computed(() => {
  const bodiesById = new Map(props.chart.bodies.map((body) => [body.id, body]))

  return (props.chart.aspects ?? []).flatMap((aspect) => {
    const source = bodiesById.get(aspect.sourceId)
    const target = bodiesById.get(aspect.targetId)
    const meta = aspectMeta[aspect.type]

    if (!source || !target || !meta) return []

    const orb = aspect.orb ?? 3
    const isApplying = aspect.motion === 'applying'
    const isSeparating = aspect.motion === 'separating'

    return [
      {
        id: `${aspect.sourceId}-${aspect.targetId}-${aspect.type}`,
        from: pointAtLongitude(source.longitude, ASPECT_RADIUS),
        to: pointAtLongitude(target.longitude, ASPECT_RADIUS),
        color: meta.color,
        dash: isSeparating ? '3 6' : meta.dash,
        width: aspect.perfection ? 2.8 : isApplying ? 2.1 : 1.45,
        opacity: aspect.perfection ? 0.95 : isApplying ? 0.82 : 0.48,
        motion: aspect.motion,
        perfection: aspect.perfection,
        orb
      }
    ]
  })
})

const roleBodies = computed(() => {
  return renderedBodies.value.filter((body) => body.role || body.id === 'moon')
})

function roleLabel(role: HoraryBodyRole | undefined, bodyId: string): string {
  if (role) return roleTexts[role]
  if (bodyId === 'moon') return 'Lua'
  return 'Ponto'
}

function bodyCss(body: RenderedBody): Record<string, string> {
  return {
    '--body-accent': body.accent
  }
}

const tooltipStyle = computed<Record<string, string>>(() => {
  if (!tooltip.value) return {} as Record<string, string>

  return {
    left: `${tooltip.value.x}px`,
    top: `${tooltip.value.y}px`,
    '--tooltip-accent': tooltip.value.body.accent
  }
})

function tooltipRoleLabel(body: RenderedBody): string {
  if (body.role) return roleTexts[body.role]
  if (body.kind === 'point') return 'Ponto calculado'
  if (body.kind === 'asteroid') return 'Asteroide'
  return 'Corpo celeste'
}

function showTooltip(body: RenderedBody, event: MouseEvent | FocusEvent | KeyboardEvent): void {
  const shell = chartShell.value
  const target = event.currentTarget as SVGGElement | null

  if (!shell || !target) return

  const shellRect = shell.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const tooltipHalfWidth = 118
  const centerX = targetRect.left + targetRect.width / 2 - shellRect.left
  const top = targetRect.top - shellRect.top
  const bottom = targetRect.bottom - shellRect.top
  const placement: TooltipPlacement = top > 132 ? 'above' : 'below'

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

function bodyName(bodyId: string): string {
  return props.chart.bodies.find((body) => body.id === bodyId)?.name ?? bodyId
}
</script>

<style scoped>
.horary-shell {
  position: relative;
  isolation: isolate;
  width: 100%;
  box-sizing: border-box;
  padding: 22px;
  border: 1px solid rgb(190 154 255 / 22%);
  border-radius: 32px;
  color: #fdf7ff;
  background:
    radial-gradient(circle at 18% 10%, rgb(139 92 246 / 26%) 0, transparent 30%),
    radial-gradient(circle at 86% 22%, rgb(67 155 196 / 18%) 0, transparent 28%),
    linear-gradient(145deg, #170d25 0%, #2b143f 54%, #120818 100%);
  box-shadow:
    0 28px 80px rgb(30 12 47 / 24%),
    inset 0 1px 0 rgb(255 255 255 / 10%);
}

.horary-header {
  margin-bottom: 18px;
  text-align: center;
}

.eyebrow,
.reading-eyebrow {
  display: inline-flex;
  margin-bottom: 7px;
  font:
    800 10px/1.2 Arial,
    Helvetica,
    sans-serif;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: #d9b6ff;
}

.horary-header h2 {
  margin: 0;
  font:
    700 clamp(25px, 4vw, 38px)/1.1 Georgia,
    'Times New Roman',
    serif;
  color: #fff8e8;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

.meta-row span {
  padding: 7px 10px;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 999px;
  font:
    700 11px/1.2 Arial,
    Helvetica,
    sans-serif;
  color: #f2e6ff;
  background: rgb(255 255 255 / 7%);
}

.horary-grid {
  display: grid;
  grid-template-columns: minmax(0, 720px) minmax(280px, 1fr);
  gap: 18px;
  align-items: start;
}

.wheel-card {
  box-sizing: border-box;
  padding: 16px;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 28px;
  background:
    radial-gradient(circle at 50% 50%, rgb(225 214 248 / 10%) 0, transparent 42%),
    rgb(255 255 255 / 6%);
}

.horary-chart {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.sky-circle {
  stroke: rgb(232 211 255 / 45%);
  stroke-width: 1;
}

.field-circle {
  stroke: #6c4b87;
  stroke-width: 1;
}

.ring {
  fill: none;
  stroke: #3c254f;
}

.outer-ring {
  stroke-width: 2.2;
}

.zodiac-inner-ring {
  stroke-width: 1.5;
}

.house-inner-ring {
  stroke: #7f6a92;
  stroke-width: 1;
}

.aspect-ring {
  stroke: #a896b8;
  stroke-width: 0.8;
  stroke-dasharray: 2 5;
  opacity: 0.8;
}

.zodiac-band path {
  stroke: #f2ebff;
  stroke-width: 0.8;
}

.degree-ticks line {
  stroke: #5e4a72;
  stroke-width: 0.45;
  opacity: 0.72;
}

.degree-ticks line.is-five {
  stroke-width: 0.8;
}

.degree-ticks line.is-ten {
  stroke-width: 1.05;
  opacity: 0.95;
}

.zodiac-divisions line {
  stroke: #39234c;
  stroke-width: 1.15;
}

.zodiac-label circle {
  fill: #158ba6;
  stroke: #dcfbff;
  stroke-width: 2;
  filter: url(#horary-glow);
}

.zodiac-label text {
  text-anchor: middle;
  font:
    25px/1 'Apple Symbols',
    'Noto Sans Symbols 2',
    'Segoe UI Symbol',
    serif;
  fill: #ffffff;
  pointer-events: none;
}

.aspect-lines line {
  vector-effect: non-scaling-stroke;
}

.aspect-lines line.is-applying {
  filter: drop-shadow(0 0 4px rgb(255 255 255 / 28%));
}

.aspect-lines line.is-perfection {
  filter: drop-shadow(0 0 7px rgb(224 199 255 / 52%));
}

.house-cusps line {
  stroke: #715e86;
  stroke-width: 1;
}

.house-cusps line.is-axis {
  stroke: #2b173d;
  stroke-width: 1.9;
}

.house-labels circle {
  fill: rgb(255 253 247 / 94%);
  stroke: #8c79a2;
  stroke-width: 1;
}

.house-labels text {
  text-anchor: middle;
  font:
    800 11px/1 Arial,
    Helvetica,
    sans-serif;
  fill: #49385f;
}

.cusp-degrees text {
  text-anchor: middle;
  font:
    700 6.5px/1 Arial,
    Helvetica,
    sans-serif;
  fill: #594768;
  paint-order: stroke fill;
  stroke: #faf7ff;
  stroke-width: 2px;
}

.axes line {
  stroke: #321d45;
  stroke-width: 1.8;
}

.axes circle {
  fill: #46205f;
  stroke: #fffaff;
  stroke-width: 2;
  filter: url(#horary-glow);
}

.axes text {
  text-anchor: middle;
  font:
    900 9px/1 Arial,
    Helvetica,
    sans-serif;
  fill: #fffaff;
}

.body {
  --body-accent: #246f9f;

  cursor: pointer;
  outline: none;
}

.body-leader {
  stroke: var(--body-accent);
  stroke-width: 0.9;
  stroke-opacity: 0.65;
}

.exact-dot {
  fill: var(--body-accent);
}

.body-disc {
  fill: var(--body-accent);
  stroke: #fffaff;
  stroke-width: 1.8;
  filter: url(#horary-glow);
  transform-box: fill-box;
  transform-origin: center;
  transition:
    fill 160ms ease,
    transform 160ms ease,
    filter 160ms ease;
}

.body.role-querent .body-disc,
.body.role-quesited .body-disc,
.body.is-moon .body-disc {
  stroke-width: 2.7;
}

.body.role-querent .body-disc {
  filter: url(#horary-glow) drop-shadow(0 0 8px rgb(139 92 246 / 72%));
}

.body.role-quesited .body-disc {
  filter: url(#horary-glow) drop-shadow(0 0 8px rgb(214 168 79 / 72%));
}

.body-glyph {
  text-anchor: middle;
  font:
    21px/1 'Apple Symbols',
    'Noto Sans Symbols 2',
    'Segoe UI Symbol',
    serif;
  fill: #ffffff;
  pointer-events: none;
}

.body-glyph.is-text {
  font:
    900 10px/1 Arial,
    Helvetica,
    sans-serif;
  letter-spacing: -0.2px;
}

.body-degree {
  text-anchor: middle;
  font:
    800 7px/1 Arial,
    Helvetica,
    sans-serif;
  fill: #523f61;
  paint-order: stroke fill;
  stroke: #faf7ff;
  stroke-width: 2.4px;
}

.retrograde {
  text-anchor: middle;
  font:
    900 9px/1 Georgia,
    serif;
  fill: #b42371;
  paint-order: stroke fill;
  stroke: #faf7ff;
  stroke-width: 2px;
}

.center-dot {
  fill: #4b225f;
  stroke: #fffaff;
  stroke-width: 1.4;
}

.center-mark {
  text-anchor: middle;
  font:
    16px/1 Georgia,
    serif;
  fill: #9f6bd7;
  pointer-events: none;
}

.role-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 7px;
  margin-top: 12px;
}

.role-chips span {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  padding: 7px 9px;
  border: 1px solid rgb(255 255 255 / 13%);
  border-radius: 999px;
  font:
    700 11px/1.2 Arial,
    Helvetica,
    sans-serif;
  color: #f9edff;
  background: rgb(255 255 255 / 8%);
}

.role-chips strong {
  color: #d9b6ff;
}

.reading-panel {
  box-sizing: border-box;
  padding: 20px;
  border: 1px solid rgb(255 255 255 / 13%);
  border-radius: 26px;
  background:
    radial-gradient(circle at 90% 10%, rgb(89 137 204 / 14%) 0, transparent 28%),
    rgb(255 255 255 / 7%);
}

.answer {
  display: inline-flex;
  margin-bottom: 12px;
  padding: 9px 12px;
  border-radius: 999px;
  font:
    900 12px/1.2 Arial,
    Helvetica,
    sans-serif;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.tone-positive {
  color: #dffdf0;
  background: rgb(22 131 111 / 34%);
}

.tone-negative {
  color: #ffe6e8;
  background: rgb(198 59 85 / 34%);
}

.tone-mixed {
  color: #fff2cf;
  background: rgb(214 168 79 / 32%);
}

.tone-unclear {
  color: #ede5ff;
  background: rgb(139 92 246 / 28%);
}

.summary {
  margin: 0 0 18px;
  font:
    600 14px/1.55 Arial,
    Helvetica,
    sans-serif;
  color: #f5eafd;
}

.reading-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 18px;
}

.reading-section h3 {
  margin: 0;
  font:
    700 18px/1.2 Georgia,
    'Times New Roman',
    serif;
  color: #fff8e8;
}

.significator-card,
.testimony-card {
  padding: 12px;
  border: 1px solid rgb(255 255 255 / 11%);
  border-radius: 16px;
  background: rgb(255 255 255 / 7%);
}

.significator-card span {
  display: block;
  margin-bottom: 3px;
  font:
    900 10px/1.2 Arial,
    Helvetica,
    sans-serif;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #d9b6ff;
}

.significator-card strong,
.testimony-card strong {
  display: block;
  margin-bottom: 5px;
  font:
    800 13px/1.2 Arial,
    Helvetica,
    sans-serif;
  color: #fff8e8;
}

.significator-card p,
.testimony-card p {
  margin: 0;
  font:
    600 12px/1.45 Arial,
    Helvetica,
    sans-serif;
  color: #eadff2;
}

.body:hover .body-disc,
.body:focus-visible .body-disc,
.body.is-active .body-disc {
  fill: color-mix(in srgb, var(--body-accent) 76%, #ffffff);
  stroke: #ffffff;
  transform: scale(1.15);
  filter: url(#horary-glow)
    drop-shadow(0 0 8px color-mix(in srgb, var(--body-accent) 58%, transparent));
}

.body:hover .body-leader,
.body:focus-visible .body-leader,
.body.is-active .body-leader {
  stroke-width: 1.8;
  stroke-opacity: 1;
}

.horary-tooltip {
  --tooltip-accent: #9f7aea;

  position: absolute;
  z-index: 20;
  width: 236px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 13px 15px 14px;
  border: 1px solid var(--tooltip-accent);
  border-radius: 16px;
  text-align: left;
  color: #fffaff;
  background: linear-gradient(135deg, rgb(29 14 45 / 98%), rgb(70 32 91 / 97%));
  box-shadow:
    0 18px 42px rgb(15 6 27 / 38%),
    0 0 22px color-mix(in srgb, var(--tooltip-accent) 30%, transparent);
  pointer-events: none;
}

.horary-tooltip.is-above {
  transform: translate(-50%, -100%);
}

.horary-tooltip.is-below {
  transform: translate(-50%, 0);
}

.horary-tooltip::after {
  content: '';
  position: absolute;
  left: 50%;
  width: 10px;
  height: 10px;
  border: solid var(--tooltip-accent);
  background: #45205b;
  transform: translateX(-50%) rotate(45deg);
}

.horary-tooltip.is-above::after {
  bottom: -6px;
  border-width: 0 1px 1px 0;
}

.horary-tooltip.is-below::after {
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
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  border: 1px solid var(--tooltip-accent);
  border-radius: 50%;
  font:
    24px/1 'Apple Symbols',
    'Noto Sans Symbols 2',
    'Segoe UI Symbol',
    serif;
  color: var(--tooltip-accent);
  background: rgb(255 255 255 / 8%);
}

.tooltip-glyph.is-text {
  font:
    900 11px/1 Arial,
    Helvetica,
    sans-serif;
  letter-spacing: -0.2px;
}

.tooltip-kind {
  font:
    800 9px/1.2 Arial,
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
  color: #fffaff;
}

.tooltip-position,
.tooltip-house {
  font:
    650 11px/1.35 Arial,
    Helvetica,
    sans-serif;
  color: #ece3f5;
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
    800 9px/1.2 Arial,
    Helvetica,
    sans-serif;
  color: #23112f;
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

@media (max-width: 900px) {
  .horary-grid {
    grid-template-columns: 1fr;
  }

  .horary-shell {
    padding: 14px;
    border-radius: 24px;
  }

  .wheel-card,
  .reading-panel {
    border-radius: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .body-disc,
  .tooltip-fade-enter-active,
  .tooltip-fade-leave-active {
    transition: none;
  }
}
</style>
