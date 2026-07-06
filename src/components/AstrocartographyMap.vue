<template>
  <section class="astro-map" :style="shellStyle" @keydown.esc="closeTooltip">
    <header class="astro-map__header">
      <div>
        <p class="astro-map__eyebrow">Cartografia celeste</p>
        <h2>{{ chart.title || 'Mapa de astrocartografia' }}</h2>
        <p v-if="chart.subtitle" class="astro-map__subtitle">
          {{ chart.subtitle }}
        </p>
      </div>

      <div class="astro-map__metadata" aria-label="Dados do mapa">
        <span v-if="chart.localDateTimeLabel">
          <span aria-hidden="true">✦</span>
          {{ chart.localDateTimeLabel }}
        </span>
        <span v-if="chart.timezoneLabel">
          <span aria-hidden="true">⌖</span>
          {{ chart.timezoneLabel }}
        </span>
        <span>
          <span aria-hidden="true">◷</span>
          {{ utcLabel }}
        </span>
      </div>
    </header>

    <div v-if="showLegend" class="astro-map__filters">
      <div class="astro-map__filter-group">
        <span class="astro-map__filter-title">Planetas</span>
        <div class="astro-map__filter-list">
          <button
            v-for="planet in allPlanets"
            :key="planet.id"
            type="button"
            class="astro-map__planet-filter"
            :class="{ 'is-active': visiblePlanets.includes(planet.id) }"
            :aria-pressed="visiblePlanets.includes(planet.id)"
            :title="planet.name"
            @click="togglePlanet(planet.id)"
          >
            <span
              class="astro-map__planet-dot"
              :style="{ '--planet-color': planet.color }"
              aria-hidden="true"
            >
              {{ planet.glyph }}
            </span>
            <span>{{ planet.name }}</span>
          </button>
        </div>
      </div>

      <div class="astro-map__filter-group astro-map__filter-group--angles">
        <span class="astro-map__filter-title">Ângulos</span>
        <div class="astro-map__filter-list">
          <button
            v-for="angle in angleOptions"
            :key="angle.id"
            type="button"
            class="astro-map__angle-filter"
            :class="{ 'is-active': visibleAngles.includes(angle.id) }"
            :aria-pressed="visibleAngles.includes(angle.id)"
            @click="toggleAngle(angle.id)"
          >
            <strong>{{ angle.id }}</strong>
            <span>{{ angle.shortName }}</span>
          </button>
        </div>
      </div>
    </div>

    <div ref="stageRef" class="astro-map__stage">
      <svg
        class="astro-map__canvas"
        :viewBox="mapViewBox"
        role="img"
        :aria-label="mapAriaLabel"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient :id="oceanGradientId" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#141433" />
            <stop offset="48%" stop-color="#211844" />
            <stop offset="100%" stop-color="#101b35" />
          </linearGradient>
          <linearGradient :id="landGradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#433662" />
            <stop offset="100%" stop-color="#2d294f" />
          </linearGradient>
          <radialGradient :id="auraGradientId" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stop-color="#d9b969" stop-opacity="0.11" />
            <stop offset="58%" stop-color="#875fc1" stop-opacity="0.04" />
            <stop offset="100%" stop-color="#080c21" stop-opacity="0.24" />
          </radialGradient>
          <filter :id="lineGlowId" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter :id="markerGlowId" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath :id="mapClipId">
            <rect width="960" height="480" rx="14" />
          </clipPath>
        </defs>

        <g :clip-path="`url(#${mapClipId})`">
          <rect
            width="960"
            height="480"
            :fill="`url(#${oceanGradientId})`"
            @pointerdown="closeTooltip"
          />
          <rect width="960" height="480" :fill="`url(#${auraGradientId})`" pointer-events="none" />

          <g v-if="showGrid" class="astro-map__grid" aria-hidden="true">
            <line
              v-for="longitude in gridLongitudes"
              :key="`longitude-${longitude}`"
              :x1="projectLongitude(longitude)"
              y1="0"
              :x2="projectLongitude(longitude)"
              y2="480"
            />
            <line
              v-for="latitude in gridLatitudes"
              :key="`latitude-${latitude}`"
              x1="0"
              :y1="projectLatitude(latitude)"
              x2="960"
              :y2="projectLatitude(latitude)"
            />
          </g>

          <path
            :d="WORLD_LAND_PATH"
            :fill="`url(#${landGradientId})`"
            class="astro-map__land"
            pointer-events="none"
          />
          <path :d="WORLD_BORDER_PATH" class="astro-map__borders" pointer-events="none" />

          <g class="astro-map__coordinates" aria-hidden="true">
            <text
              v-for="longitude in gridLongitudes"
              :key="`longitude-label-${longitude}`"
              :x="projectLongitude(longitude) + 4"
              y="447"
            >
              {{ formatLongitude(longitude) }}
            </text>
            <text
              v-for="latitude in gridLatitudes"
              :key="`latitude-label-${latitude}`"
              x="7"
              :y="projectLatitude(latitude) - 5"
            >
              {{ formatLatitude(latitude) }}
            </text>
          </g>

          <g class="astro-map__lines">
            <g
              v-for="line in visibleLines"
              :key="line.id"
              :data-line-id="line.id"
              class="astro-map__line"
              :class="{
                'is-active': activeLineId === line.id,
                'is-muted': activeLineId && activeLineId !== line.id
              }"
              role="button"
              tabindex="0"
              :aria-label="lineAriaLabel(line)"
              @pointerenter="showLinePreview(line, $event)"
              @pointerleave="hideLinePreview"
              @focus="showLinePreview(line, $event)"
              @blur="hideLinePreview"
              @click.stop="selectLine(line, $event)"
              @keydown.enter.prevent="selectLine(line, $event)"
              @keydown.space.prevent="selectLine(line, $event)"
            >
              <path
                v-for="(segment, segmentIndex) in line.segments"
                :key="`${line.id}-${segmentIndex}-hit`"
                :d="segmentPath(segment)"
                class="astro-map__line-hit"
              />
              <path
                v-for="(segment, segmentIndex) in line.segments"
                :key="`${line.id}-${segmentIndex}`"
                :d="segmentPath(segment)"
                class="astro-map__line-stroke"
                :stroke="line.color"
                :filter="activeLineId === line.id ? `url(#${lineGlowId})` : undefined"
              />
            </g>
          </g>

          <g v-if="showLabels" class="astro-map__edge-labels" aria-hidden="true">
            <g
              v-for="label in meridianTopLabels"
              :key="`${label.line.id}-top-label`"
              class="astro-map__edge-label"
              :class="{ 'is-active': activeLineId === label.line.id }"
            >
              <line
                :x1="label.anchorX"
                y1="37"
                :x2="label.labelX"
                y2="29"
                :stroke="label.line.color"
              />
              <rect :x="label.labelX - 20" y="6" width="40" height="23" rx="11.5" />
              <text :x="label.labelX - 6" y="22" text-anchor="middle">
                {{ lineGlyph(label.line) }}
              </text>
              <text
                :x="label.labelX + 10"
                y="21"
                text-anchor="middle"
                class="astro-map__edge-angle"
              >
                MC
              </text>
            </g>

            <g
              v-for="label in meridianBottomLabels"
              :key="`${label.line.id}-bottom-label`"
              class="astro-map__edge-label"
              :class="{ 'is-active': activeLineId === label.line.id }"
            >
              <line
                :x1="label.anchorX"
                y1="443"
                :x2="label.labelX"
                y2="451"
                :stroke="label.line.color"
              />
              <rect :x="label.labelX - 20" y="451" width="40" height="23" rx="11.5" />
              <text :x="label.labelX - 6" y="467" text-anchor="middle">
                {{ lineGlyph(label.line) }}
              </text>
              <text
                :x="label.labelX + 10"
                y="466"
                text-anchor="middle"
                class="astro-map__edge-angle"
              >
                IC
              </text>
            </g>

            <g
              v-for="label in ascendantLabels"
              :key="`${label.line.id}-asc-label`"
              class="astro-map__edge-label astro-map__edge-label--side"
              :class="{ 'is-active': activeLineId === label.line.id }"
            >
              <line
                :x1="label.anchorX"
                :y1="label.anchorY"
                x2="37"
                :y2="label.labelY"
                :stroke="label.line.color"
              />
              <rect x="5" :y="label.labelY - 11.5" width="43" height="23" rx="11.5" />
              <text x="17" :y="label.labelY + 5" text-anchor="middle">
                {{ lineGlyph(label.line) }}
              </text>
              <text x="34" :y="label.labelY + 4" text-anchor="middle" class="astro-map__edge-angle">
                AC
              </text>
            </g>

            <g
              v-for="label in descendantLabels"
              :key="`${label.line.id}-dsc-label`"
              class="astro-map__edge-label astro-map__edge-label--side"
              :class="{ 'is-active': activeLineId === label.line.id }"
            >
              <line
                :x1="label.anchorX"
                :y1="label.anchorY"
                x2="923"
                :y2="label.labelY"
                :stroke="label.line.color"
              />
              <rect x="912" :y="label.labelY - 11.5" width="43" height="23" rx="11.5" />
              <text x="924" :y="label.labelY + 5" text-anchor="middle">
                {{ lineGlyph(label.line) }}
              </text>
              <text
                x="941"
                :y="label.labelY + 4"
                text-anchor="middle"
                class="astro-map__edge-angle"
              >
                DC
              </text>
            </g>
          </g>

          <g
            v-if="birthplacePoint"
            class="astro-map__birthplace"
            :transform="`translate(${birthplacePoint.x} ${birthplacePoint.y})`"
            :filter="`url(#${markerGlowId})`"
            role="img"
            :aria-label="`Local de nascimento: ${chart.birthplace?.name}`"
          >
            <circle r="10" class="astro-map__birthplace-aura" />
            <circle r="4.5" class="astro-map__birthplace-dot" />
            <path
              d="M0 -13L2.3 -4.2L11.3 -6.5L4.6 0L11.3 6.5L2.3 4.2L0 13L-2.3 4.2L-11.3 6.5L-4.6 0L-11.3 -6.5L-2.3 -4.2Z"
            />
            <text x="15" y="-11">{{ chart.birthplace?.name }}</text>
          </g>
        </g>

        <rect width="960" height="480" rx="14" class="astro-map__frame" pointer-events="none" />
      </svg>

      <div class="astro-map__zoom" aria-label="Controles de zoom">
        <button
          type="button"
          aria-label="Aumentar zoom"
          :disabled="zoom >= MAX_ZOOM"
          @click="zoomIn"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Diminuir zoom"
          :disabled="zoom <= MIN_ZOOM"
          @click="zoomOut"
        >
          −
        </button>
        <button
          type="button"
          aria-label="Restaurar zoom"
          :disabled="zoom === MIN_ZOOM"
          @click="resetZoom"
        >
          ⟲
        </button>
      </div>

      <Transition name="astro-map-tooltip">
        <aside
          v-if="tooltipLine"
          class="astro-map__tooltip"
          :class="{ 'is-pinned': tooltipPinned }"
          :style="tooltipStyle"
          role="status"
          aria-live="polite"
        >
          <div
            class="astro-map__tooltip-glyph"
            :style="{ '--line-color': tooltipLine.color }"
            aria-hidden="true"
          >
            {{ lineGlyph(tooltipLine) }}
          </div>
          <div>
            <span class="astro-map__tooltip-kicker">
              {{ tooltipPinned ? 'Linha selecionada' : 'Linha planetária' }}
            </span>
            <strong>{{ tooltipLine.planetName }} · {{ tooltipLine.angle }}</strong>
            <span>{{ angleDescription(tooltipLine.angle) }}</span>
          </div>
          <button
            v-if="tooltipPinned"
            type="button"
            aria-label="Fechar detalhes da linha"
            @click="closeTooltip"
          >
            ×
          </button>
        </aside>
      </Transition>
    </div>

    <footer class="astro-map__footer">
      <p>
        <span aria-hidden="true">✦</span>
        Toque ou passe o cursor sobre uma linha para identificá-la.
      </p>
      <p>{{ WORLD_MAP_ATTRIBUTION }}</p>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch, type CSSProperties } from 'vue'
import { getAstrologyGlyph } from '../core/astrology/glyphs'
import type {
  AstrocartographyAngle,
  AstrocartographyChartData,
  AstrocartographyCoordinate,
  AstrocartographyLine,
  AstrocartographyLineEvent,
  AstrocartographyPlanetId
} from '../core/astrocartography/types'
import {
  WORLD_BORDER_PATH,
  WORLD_LAND_PATH,
  WORLD_MAP_ATTRIBUTION
} from '../core/astrocartography/worldMap'

interface PlanetOption {
  id: AstrocartographyPlanetId
  name: string
  glyph: string
  color: string
}

interface HorizontalEdgeLabel {
  line: AstrocartographyLine
  anchorX: number
  labelX: number
}

interface SideEdgeLabel {
  line: AstrocartographyLine
  anchorX: number
  anchorY: number
  labelY: number
}

const props = withDefaults(
  defineProps<{
    chart: AstrocartographyChartData
    maxWidth?: number
    showGrid?: boolean
    showLegend?: boolean
    showLabels?: boolean
    initialVisiblePlanets?: AstrocartographyPlanetId[]
    initialVisibleAngles?: AstrocartographyAngle[]
  }>(),
  {
    maxWidth: 1200,
    showGrid: true,
    showLegend: true,
    showLabels: true,
    initialVisiblePlanets: undefined,
    initialVisibleAngles: undefined
  }
)

const emit = defineEmits<{
  'line-select': [payload: AstrocartographyLineEvent]
  'filters-change': [
    payload: {
      planets: AstrocartographyPlanetId[]
      angles: AstrocartographyAngle[]
    }
  ]
}>()

const MAP_WIDTH = 960
const MAP_HEIGHT = 480
const MIN_ZOOM = 1
const MAX_ZOOM = 2.5
const ZOOM_STEP = 0.25

const angleOptions: ReadonlyArray<{
  id: AstrocartographyAngle
  shortName: string
}> = [
  { id: 'ASC', shortName: 'Asc' },
  { id: 'DSC', shortName: 'Dsc' },
  { id: 'MC', shortName: 'MC' },
  { id: 'IC', shortName: 'IC' }
]

const gridLongitudes = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150]
const gridLatitudes = [-60, -30, 0, 30, 60]

const stageRef = ref<HTMLElement>()
const visiblePlanets = ref<AstrocartographyPlanetId[]>([])
const visibleAngles = ref<AstrocartographyAngle[]>([])
const tooltipLine = ref<AstrocartographyLine>()
const tooltipPinned = ref(false)
const tooltipPosition = ref({ x: 24, y: 24 })
const zoom = ref(MIN_ZOOM)

const instanceId = useId().replace(/:/g, '')
const oceanGradientId = `${instanceId}-astro-ocean`
const landGradientId = `${instanceId}-astro-land`
const auraGradientId = `${instanceId}-astro-aura`
const lineGlowId = `${instanceId}-astro-line-glow`
const markerGlowId = `${instanceId}-astro-marker-glow`
const mapClipId = `${instanceId}-astro-map-clip`

const shellStyle = computed(
  () =>
    ({
      '--astro-map-max-width': `${props.maxWidth}px`
    }) as CSSProperties
)

const allPlanets = computed<PlanetOption[]>(() => {
  const planets = new Map<AstrocartographyPlanetId, PlanetOption>()

  for (const line of props.chart.lines) {
    if (!planets.has(line.planet)) {
      planets.set(line.planet, {
        id: line.planet,
        name: line.planetName,
        glyph: lineGlyph(line),
        color: line.color
      })
    }
  }

  return [...planets.values()]
})

const planetSignature = computed(() => allPlanets.value.map((planet) => planet.id).join('|'))

watch(
  planetSignature,
  () => {
    const available = allPlanets.value.map((planet) => planet.id)
    visiblePlanets.value = props.initialVisiblePlanets
      ? props.initialVisiblePlanets.filter((planet) => available.includes(planet))
      : available
  },
  { immediate: true }
)

watch(
  () => props.initialVisibleAngles,
  (initialAngles) => {
    visibleAngles.value = initialAngles?.length
      ? initialAngles.filter((angle) => angleOptions.some((option) => option.id === angle))
      : angleOptions.map((angle) => angle.id)
  },
  { immediate: true }
)

const visibleLines = computed(() =>
  props.chart.lines.filter(
    (line) =>
      visiblePlanets.value.includes(line.planet) &&
      visibleAngles.value.includes(line.angle) &&
      line.segments.some((segment) => segment.length > 1)
  )
)

const activeLineId = computed(() => tooltipLine.value?.id)

const utcLabel = computed(() => {
  const date = new Date(props.chart.momentUtc)

  if (Number.isNaN(date.getTime())) return props.chart.momentUtc

  return `${new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'UTC'
  }).format(date)} UTC`
})

const mapAriaLabel = computed(() => {
  const place = props.chart.birthplace?.name
    ? `, com nascimento em ${props.chart.birthplace.name}`
    : ''

  return `Mapa-múndi de astrocartografia com ${visibleLines.value.length} linhas planetárias visíveis${place}.`
})

const mapViewBox = computed(() => {
  const width = MAP_WIDTH / zoom.value
  const height = MAP_HEIGHT / zoom.value
  const x = (MAP_WIDTH - width) / 2
  const y = (MAP_HEIGHT - height) / 2

  return `${x} ${y} ${width} ${height}`
})

const birthplacePoint = computed(() => {
  if (!props.chart.birthplace) return undefined

  return {
    x: projectLongitude(props.chart.birthplace.longitude),
    y: projectLatitude(props.chart.birthplace.latitude)
  }
})

const meridianTopLabels = computed(() =>
  layoutHorizontalLabels(visibleLines.value.filter((line) => line.angle === 'MC'))
)

const meridianBottomLabels = computed(() =>
  layoutHorizontalLabels(visibleLines.value.filter((line) => line.angle === 'IC'))
)

const ascendantLabels = computed(() =>
  layoutSideLabels(
    visibleLines.value.filter((line) => line.angle === 'ASC'),
    'left'
  )
)

const descendantLabels = computed(() =>
  layoutSideLabels(
    visibleLines.value.filter((line) => line.angle === 'DSC'),
    'right'
  )
)

const tooltipStyle = computed(
  () =>
    ({
      left: `${tooltipPosition.value.x}px`,
      top: `${tooltipPosition.value.y}px`
    }) as CSSProperties
)

function projectLongitude(longitude: number): number {
  return ((longitude + 180) / 360) * MAP_WIDTH
}

function projectLatitude(latitude: number): number {
  return ((90 - latitude) / 180) * MAP_HEIGHT
}

function segmentPath(segment: AstrocartographyCoordinate[]): string {
  return segment
    .map((coordinate, index) => {
      const command = index === 0 ? 'M' : 'L'
      return `${command}${projectLongitude(coordinate.longitude).toFixed(2)},${projectLatitude(
        coordinate.latitude
      ).toFixed(2)}`
    })
    .join(' ')
}

function lineGlyph(line: AstrocartographyLine): string {
  return (
    getAstrologyGlyph(line.symbol) || getAstrologyGlyph(line.planet) || line.planetName.slice(0, 1)
  )
}

function layoutHorizontalLabels(lines: AstrocartographyLine[]): HorizontalEdgeLabel[] {
  const sorted = lines
    .map((line) => ({
      line,
      anchorX: projectLongitude(line.segments[0]?.[0]?.longitude ?? 0)
    }))
    .sort((a, b) => a.anchorX - b.anchorX)

  if (sorted.length === 0) return []
  if (sorted.length === 1) {
    return [{ ...sorted[0], labelX: Math.min(936, Math.max(24, sorted[0].anchorX)) }]
  }

  return sorted.map((label, index) => ({
    ...label,
    labelX: 34 + (index * (MAP_WIDTH - 68)) / (sorted.length - 1)
  }))
}

function layoutSideLabels(lines: AstrocartographyLine[], side: 'left' | 'right'): SideEdgeLabel[] {
  const sorted = lines
    .map((line) => {
      const points = line.segments.flat()
      const point = points.reduce<AstrocartographyCoordinate | undefined>((closest, candidate) => {
        if (!closest) return candidate
        return side === 'left'
          ? candidate.longitude < closest.longitude
            ? candidate
            : closest
          : candidate.longitude > closest.longitude
            ? candidate
            : closest
      }, undefined)

      return {
        line,
        anchorX: projectLongitude(point?.longitude ?? 0),
        anchorY: projectLatitude(point?.latitude ?? 0)
      }
    })
    .sort((a, b) => a.anchorY - b.anchorY)

  if (sorted.length === 0) return []
  if (sorted.length === 1) {
    return [
      {
        ...sorted[0],
        labelY: Math.min(462, Math.max(18, sorted[0].anchorY))
      }
    ]
  }

  return sorted.map((label, index) => ({
    ...label,
    labelY: 24 + (index * (MAP_HEIGHT - 48)) / (sorted.length - 1)
  }))
}

function lineAnchor(line: AstrocartographyLine): AstrocartographyCoordinate {
  const segment = line.segments.find((candidate) => candidate.length > 0) ?? line.segments[0]
  return (
    segment?.[Math.floor(segment.length / 2)] ?? {
      latitude: 0,
      longitude: 0
    }
  )
}

function eventPosition(event: Event): { x: number; y: number } {
  const stage = stageRef.value
  const fallback = { x: 24, y: 24 }

  if (!stage) return fallback

  const stageRect = stage.getBoundingClientRect()
  const targetRect =
    event.currentTarget instanceof Element ? event.currentTarget.getBoundingClientRect() : undefined
  const pointer = event instanceof PointerEvent ? event : undefined
  const rawX = pointer?.clientX ?? (targetRect ? targetRect.left + targetRect.width / 2 : 0)
  const rawY = pointer?.clientY ?? (targetRect ? targetRect.top + targetRect.height / 2 : 0)
  const x = rawX - stageRect.left + stage.scrollLeft + 14
  const y = rawY - stageRect.top + 14
  const minimumX = stage.scrollLeft + 12
  const maximumX = Math.max(minimumX, stage.scrollLeft + stage.clientWidth - 254)

  return {
    x: Math.min(Math.max(minimumX, x), maximumX),
    y: Math.min(Math.max(12, y), Math.max(12, stageRect.height - 130))
  }
}

function showLinePreview(line: AstrocartographyLine, event: Event): void {
  if (tooltipPinned.value) return
  tooltipLine.value = line
  tooltipPosition.value = eventPosition(event)
}

function hideLinePreview(): void {
  if (!tooltipPinned.value) tooltipLine.value = undefined
}

function selectLine(line: AstrocartographyLine, event: Event): void {
  const wasPinned = tooltipPinned.value && tooltipLine.value?.id === line.id

  if (wasPinned) {
    closeTooltip()
    return
  }

  tooltipLine.value = line
  tooltipPinned.value = true
  tooltipPosition.value = eventPosition(event)
  emit('line-select', { line, anchor: lineAnchor(line) })
}

function closeTooltip(): void {
  tooltipLine.value = undefined
  tooltipPinned.value = false
}

function emitFilters(): void {
  emit('filters-change', {
    planets: [...visiblePlanets.value],
    angles: [...visibleAngles.value]
  })
}

function togglePlanet(planet: AstrocartographyPlanetId): void {
  visiblePlanets.value = visiblePlanets.value.includes(planet)
    ? visiblePlanets.value.filter((candidate) => candidate !== planet)
    : [...visiblePlanets.value, planet]
  closeTooltip()
  emitFilters()
}

function toggleAngle(angle: AstrocartographyAngle): void {
  visibleAngles.value = visibleAngles.value.includes(angle)
    ? visibleAngles.value.filter((candidate) => candidate !== angle)
    : [...visibleAngles.value, angle]
  closeTooltip()
  emitFilters()
}

function lineAriaLabel(line: AstrocartographyLine): string {
  return `Linha de ${line.planetName} no ${angleName(line.angle)}.`
}

function angleName(angle: AstrocartographyAngle): string {
  const names: Record<AstrocartographyAngle, string> = {
    ASC: 'Ascendente',
    DSC: 'Descendente',
    MC: 'Meio do Céu',
    IC: 'Fundo do Céu'
  }

  return names[angle]
}

function angleDescription(angle: AstrocartographyAngle): string {
  const descriptions: Record<AstrocartographyAngle, string> = {
    ASC: 'Ascendente · o planeta estava surgindo no horizonte.',
    DSC: 'Descendente · o planeta estava se pondo no horizonte.',
    MC: 'Meio do Céu · o planeta estava culminando no meridiano.',
    IC: 'Fundo do Céu · o planeta estava no antimeridiano.'
  }

  return descriptions[angle]
}

function formatLongitude(longitude: number): string {
  if (longitude === 0) return '0°'
  return `${Math.abs(longitude)}°${longitude < 0 ? 'O' : 'L'}`
}

function formatLatitude(latitude: number): string {
  if (latitude === 0) return '0°'
  return `${Math.abs(latitude)}°${latitude < 0 ? 'S' : 'N'}`
}

function zoomIn(): void {
  zoom.value = Math.min(MAX_ZOOM, zoom.value + ZOOM_STEP)
}

function zoomOut(): void {
  zoom.value = Math.max(MIN_ZOOM, zoom.value - ZOOM_STEP)
}

function resetZoom(): void {
  zoom.value = MIN_ZOOM
}

onBeforeUnmount(closeTooltip)
</script>

<style scoped>
.astro-map {
  --astro-map-ink: #f7f0ff;
  --astro-map-muted: #bdb2ce;
  --astro-map-gold: #e3c36e;
  position: relative;
  width: min(100%, var(--astro-map-max-width));
  overflow: hidden;
  border: 1px solid rgb(230 205 145 / 24%);
  border-radius: 28px;
  color: var(--astro-map-ink);
  background:
    radial-gradient(circle at 12% 0%, rgb(135 82 174 / 24%), transparent 34%),
    radial-gradient(circle at 88% 12%, rgb(41 112 156 / 20%), transparent 31%),
    linear-gradient(145deg, #120d25 0%, #1b1231 52%, #0b1227 100%);
  box-shadow:
    0 28px 80px rgb(2 3 14 / 46%),
    inset 0 1px 0 rgb(255 255 255 / 7%);
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  isolation: isolate;
}

.astro-map::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: 0.21;
  background-image:
    radial-gradient(circle at 18% 28%, #fff 0 0.8px, transparent 1px),
    radial-gradient(circle at 72% 14%, #fff 0 0.7px, transparent 1px),
    radial-gradient(circle at 44% 78%, #fff 0 0.6px, transparent 1px);
  background-size:
    83px 83px,
    121px 121px,
    157px 157px;
  content: '';
  pointer-events: none;
}

.astro-map__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  padding: 26px 30px 20px;
}

.astro-map__eyebrow {
  margin: 0 0 6px;
  color: var(--astro-map-gold);
  font-size: 0.7rem;
  font-weight: 750;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.astro-map__header h2 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.5rem, 3vw, 2.35rem);
  font-weight: 500;
  letter-spacing: 0.01em;
}

.astro-map__subtitle {
  max-width: 630px;
  margin: 6px 0 0;
  color: var(--astro-map-muted);
  font-size: 0.88rem;
}

.astro-map__metadata {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 7px;
  max-width: 520px;
}

.astro-map__metadata > span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 29px;
  padding: 5px 10px;
  border: 1px solid rgb(229 205 244 / 13%);
  border-radius: 999px;
  color: #d9cfe4;
  background: rgb(10 8 25 / 34%);
  font-size: 0.72rem;
  white-space: nowrap;
}

.astro-map__metadata > span > span {
  color: var(--astro-map-gold);
}

.astro-map__filters {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  margin: 0 30px 18px;
  padding: 14px;
  border: 1px solid rgb(224 200 242 / 10%);
  border-radius: 18px;
  background: rgb(8 8 25 / 25%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 3%);
}

.astro-map__filter-group {
  min-width: 0;
}

.astro-map__filter-title {
  display: block;
  margin: 0 0 8px 2px;
  color: #9488a6;
  font-size: 0.62rem;
  font-weight: 750;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.astro-map__filter-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.astro-map__planet-filter,
.astro-map__angle-filter {
  display: inline-flex;
  align-items: center;
  min-height: 33px;
  border: 1px solid rgb(234 217 247 / 11%);
  border-radius: 999px;
  color: #978da6;
  background: rgb(255 255 255 / 2%);
  cursor: pointer;
  transition:
    color 160ms ease,
    border-color 160ms ease,
    background 160ms ease,
    transform 160ms ease;
}

.astro-map__planet-filter {
  gap: 7px;
  padding: 3px 10px 3px 4px;
  font-size: 0.7rem;
}

.astro-map__planet-filter:hover,
.astro-map__angle-filter:hover,
.astro-map__planet-filter:focus-visible,
.astro-map__angle-filter:focus-visible {
  border-color: rgb(228 199 125 / 46%);
  color: #f7effe;
  outline: none;
  transform: translateY(-1px);
}

.astro-map__planet-filter.is-active,
.astro-map__angle-filter.is-active {
  border-color: rgb(228 199 125 / 27%);
  color: #f8f1fc;
  background: rgb(150 101 181 / 13%);
}

.astro-map__planet-dot {
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--planet-color), white 24%);
  border-radius: 50%;
  color: color-mix(in srgb, var(--planet-color), white 22%);
  background: color-mix(in srgb, var(--planet-color), transparent 85%);
  font-family: 'Noto Sans Symbols 2', 'Segoe UI Symbol', serif;
  font-size: 0.93rem;
}

.astro-map__planet-filter:not(.is-active) .astro-map__planet-dot {
  filter: grayscale(1);
  opacity: 0.5;
}

.astro-map__angle-filter {
  gap: 5px;
  padding: 5px 9px;
  font-size: 0.64rem;
}

.astro-map__angle-filter strong {
  color: var(--astro-map-gold);
  font-size: 0.68rem;
}

.astro-map__stage {
  position: relative;
  margin: 0 20px;
}

.astro-map__canvas {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 16px;
  background: #11132e;
  box-shadow:
    0 18px 50px rgb(1 2 13 / 38%),
    inset 0 0 35px rgb(218 189 114 / 5%);
  touch-action: manipulation;
}

.astro-map__grid line {
  stroke: rgb(215 207 235 / 11%);
  stroke-width: 0.7;
  vector-effect: non-scaling-stroke;
}

.astro-map__land {
  stroke: rgb(222 207 237 / 19%);
  stroke-width: 0.75;
  vector-effect: non-scaling-stroke;
}

.astro-map__borders {
  fill: none;
  stroke: rgb(232 219 243 / 13%);
  stroke-width: 0.45;
  vector-effect: non-scaling-stroke;
}

.astro-map__coordinates text {
  fill: rgb(225 216 235 / 34%);
  font-size: 8px;
  letter-spacing: 0.02em;
}

.astro-map__line {
  cursor: pointer;
  outline: none;
  transition: opacity 160ms ease;
}

.astro-map__line-hit {
  fill: none;
  stroke: transparent;
  stroke-width: 12;
  pointer-events: stroke;
  vector-effect: non-scaling-stroke;
}

.astro-map__line-stroke {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.45;
  opacity: 0.82;
  pointer-events: none;
  vector-effect: non-scaling-stroke;
  transition:
    stroke-width 160ms ease,
    opacity 160ms ease;
}

.astro-map__line:hover .astro-map__line-stroke,
.astro-map__line:focus .astro-map__line-stroke,
.astro-map__line.is-active .astro-map__line-stroke {
  stroke-width: 2.7;
  opacity: 1;
}

.astro-map__line.is-muted {
  opacity: 0.24;
}

.astro-map__edge-label {
  transition: opacity 160ms ease;
}

.astro-map__edge-label line {
  stroke-width: 0.75;
  opacity: 0.68;
  vector-effect: non-scaling-stroke;
}

.astro-map__edge-label rect {
  fill: rgb(14 13 34 / 91%);
  stroke: rgb(237 222 250 / 22%);
  stroke-width: 0.7;
  vector-effect: non-scaling-stroke;
}

.astro-map__edge-label text {
  fill: #f1e7fa;
  font-family: 'Noto Sans Symbols 2', 'Segoe UI Symbol', serif;
  font-size: 11px;
}

.astro-map__edge-label .astro-map__edge-angle {
  fill: #b9afc5;
  font-family: Inter, ui-sans-serif, sans-serif;
  font-size: 5.5px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.astro-map__edge-label.is-active rect {
  fill: #2c2142;
  stroke: #e5c777;
}

.astro-map__birthplace {
  color: var(--astro-map-gold);
  pointer-events: none;
}

.astro-map__birthplace-aura {
  fill: rgb(229 197 110 / 12%);
  stroke: rgb(229 197 110 / 38%);
}

.astro-map__birthplace-dot {
  fill: #fff3bf;
}

.astro-map__birthplace path {
  fill: var(--astro-map-gold);
  stroke: #fff3c2;
  stroke-width: 0.55;
  vector-effect: non-scaling-stroke;
}

.astro-map__birthplace text {
  fill: #f7e7af;
  paint-order: stroke;
  stroke: #121026;
  stroke-width: 3px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.astro-map__frame {
  fill: none;
  stroke: rgb(231 207 142 / 29%);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.astro-map__zoom {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: grid;
  gap: 5px;
  padding: 5px;
  border: 1px solid rgb(234 216 244 / 16%);
  border-radius: 13px;
  background: rgb(12 11 30 / 84%);
  box-shadow: 0 7px 22px rgb(0 0 0 / 29%);
  backdrop-filter: blur(9px);
}

.astro-map__zoom button {
  display: grid;
  width: 30px;
  height: 30px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 8px;
  color: #eee5f7;
  background: rgb(255 255 255 / 5%);
  cursor: pointer;
  font-size: 1rem;
}

.astro-map__zoom button:hover:not(:disabled),
.astro-map__zoom button:focus-visible {
  color: #23172f;
  background: var(--astro-map-gold);
  outline: none;
}

.astro-map__zoom button:disabled {
  cursor: default;
  opacity: 0.34;
}

.astro-map__tooltip {
  position: absolute;
  z-index: 4;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  width: min(244px, calc(100% - 24px));
  padding: 12px;
  border: 1px solid rgb(229 200 126 / 38%);
  border-radius: 15px;
  color: #f6eefb;
  background:
    radial-gradient(circle at 12% 0%, rgb(137 83 173 / 24%), transparent 50%), rgb(13 11 30 / 95%);
  box-shadow:
    0 15px 38px rgb(0 0 0 / 42%),
    inset 0 1px 0 rgb(255 255 255 / 7%);
  pointer-events: none;
  transform: translateZ(0);
  backdrop-filter: blur(12px);
}

.astro-map__tooltip.is-pinned {
  pointer-events: auto;
}

.astro-map__tooltip-glyph {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--line-color), white 25%);
  border-radius: 50%;
  color: color-mix(in srgb, var(--line-color), white 24%);
  background: color-mix(in srgb, var(--line-color), transparent 82%);
  font-family: 'Noto Sans Symbols 2', 'Segoe UI Symbol', serif;
  font-size: 1.35rem;
}

.astro-map__tooltip > div:nth-child(2) {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.astro-map__tooltip-kicker {
  color: var(--astro-map-gold) !important;
  font-size: 0.56rem !important;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.astro-map__tooltip strong {
  overflow: hidden;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.9rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.astro-map__tooltip span {
  color: #bfb4cc;
  font-size: 0.65rem;
  line-height: 1.35;
}

.astro-map__tooltip > button {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: #cbbfd5;
  background: rgb(255 255 255 / 7%);
  cursor: pointer;
}

.astro-map__tooltip > button:hover,
.astro-map__tooltip > button:focus-visible {
  color: #1d1528;
  background: var(--astro-map-gold);
  outline: none;
}

.astro-map-tooltip-enter-active,
.astro-map-tooltip-leave-active {
  transition:
    opacity 140ms ease,
    transform 140ms ease;
}

.astro-map-tooltip-enter-from,
.astro-map-tooltip-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

.astro-map__footer {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 13px 30px 18px;
  color: #8e839e;
  font-size: 0.66rem;
}

.astro-map__footer p {
  margin: 0;
}

.astro-map__footer span {
  margin-right: 5px;
  color: var(--astro-map-gold);
}

@media (max-width: 820px) {
  .astro-map {
    border-radius: 21px;
  }

  .astro-map__header {
    display: grid;
    padding: 21px 18px 16px;
  }

  .astro-map__metadata {
    justify-content: flex-start;
  }

  .astro-map__filters {
    grid-template-columns: 1fr;
    margin: 0 18px 14px;
  }

  .astro-map__stage {
    margin: 0 10px;
    overflow-x: auto;
    border-radius: 15px;
    scrollbar-color: rgb(218 190 119 / 52%) rgb(8 8 25 / 42%);
    scrollbar-width: thin;
  }

  .astro-map__stage::-webkit-scrollbar {
    height: 7px;
  }

  .astro-map__stage::-webkit-scrollbar-track {
    border-radius: 999px;
    background: rgb(8 8 25 / 42%);
  }

  .astro-map__stage::-webkit-scrollbar-thumb {
    border: 1px solid rgb(8 8 25 / 65%);
    border-radius: 999px;
    background: rgb(218 190 119 / 52%);
  }

  .astro-map__canvas {
    min-width: 720px;
  }

  .astro-map__zoom {
    position: sticky;
    right: 10px;
    bottom: 10px;
    float: right;
    margin-top: -118px;
    margin-right: 10px;
  }

  .astro-map__footer {
    padding: 13px 18px 17px;
  }
}

@media (max-width: 560px) {
  .astro-map__planet-filter > span:last-child,
  .astro-map__angle-filter > span {
    display: none;
  }

  .astro-map__planet-filter {
    padding-right: 4px;
  }

  .astro-map__angle-filter {
    min-width: 33px;
    justify-content: center;
  }

  .astro-map__footer {
    display: grid;
    gap: 5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .astro-map *,
  .astro-map *::before,
  .astro-map *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
