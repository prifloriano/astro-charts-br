<template>
  <div ref="chartShell" class="destiny-matrix-shell" @mouseleave="hideTooltip" @click="hideTooltip">
    <svg
      class="destiny-matrix"
      viewBox="0 0 700 700"
      role="img"
      aria-label="Matriz do destino interativa"
    >
      <defs>
        <radialGradient id="matrix-background" cx="50%" cy="44%" r="68%">
          <stop offset="0%" stop-color="#fffdf8" />
          <stop offset="62%" stop-color="#faf6ff" />
          <stop offset="100%" stop-color="#f2ebff" />
        </radialGradient>

        <marker id="arrow-purple" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#6d28d9" />
        </marker>

        <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#db2777" />
        </marker>
      </defs>

      <rect width="700" height="700" fill="url(#matrix-background)" />

      <!-- Idades principais -->
      <g class="age-main">
        <text
          v-for="label in ageMainLabels"
          :key="label.id"
          :x="label.x"
          :y="label.y"
          :text-anchor="label.anchor"
        >
          <tspan
            v-for="(line, index) in label.lines"
            :key="line"
            :x="label.x"
            :dy="index === 0 ? 0 : 8"
          >
            {{ line }}
          </tspan>
        </text>
      </g>

      <!-- Arcanos e faixas de idade em volta do octógono -->
      <g class="edge-ticks">
        <g
          v-for="tick in renderedAgeTicks"
          :key="tick.id"
          :transform="`translate(${tick.x} ${tick.y}) rotate(${tick.angle})`"
        >
          <text class="edge-arcana" text-anchor="middle" y="-4">
            {{ tick.arcana }}
          </text>

          <text class="edge-age" text-anchor="middle" y="8">
            {{ tick.ageText }}
          </text>
        </g>
      </g>

      <!-- Octógono externo -->
      <polygon :points="octagonPoints" fill="none" stroke="#3e2f57" stroke-width="1.8" />

      <!-- Quadrado reto -->
      <polygon :points="squarePoints" fill="none" stroke="#3e2f57" stroke-width="1.6" />

      <!-- Quadrado inclinado -->
      <polygon :points="diamondPoints" fill="none" stroke="#3e2f57" stroke-width="1.6" />

      <!-- Linhas estruturais -->
      <g class="structure-lines">
        <line
          v-for="line in structureLines"
          :key="line.id"
          :x1="line.x1"
          :y1="line.y1"
          :x2="line.x2"
          :y2="line.y2"
        />
      </g>

      <!-- Linha masculina -->
      <line x1="230" y1="230" x2="470" y2="470" class="male-line" marker-end="url(#arrow-purple)" />

      <!-- Linha feminina -->
      <line x1="230" y1="470" x2="470" y2="230" class="female-line" marker-end="url(#arrow-red)" />

      <!-- Linha pontilhada -->
      <line x1="350" y1="520" x2="520" y2="350" class="dashed-line" />

      <!-- Labels das linhas -->
      <text x="245" y="225" transform="rotate(45 245 225)" class="line-label">
        male generation line
      </text>

      <text x="395" y="290" transform="rotate(-45 395 290)" class="line-label">
        female generation line
      </text>

      <!-- Ícones -->
      <text x="385" y="440" class="love-icon">♥</text>
      <text x="440" y="390" class="money-icon">$</text>

      <!-- Bolinhas interativas -->
      <g
        v-for="node in nodes"
        :key="node.id"
        class="matrix-node"
        :class="{ 'is-active': tooltip?.node.id === node.id }"
        :style="nodeStyle(node)"
        :data-node-id="node.id"
        tabindex="0"
        role="button"
        :aria-label="`Arcano ${node.value}: ${arcanaDetails[node.value]?.name ?? 'Arcano'}`"
        :aria-describedby="tooltip?.node.id === node.id ? 'arcana-tooltip' : undefined"
        @mouseenter="showTooltip(node, $event)"
        @mouseleave="hideTooltip"
        @click.stop="showTooltip(node, $event)"
        @focus="showTooltip(node, $event)"
        @blur="hideTooltip"
        @keydown.enter.prevent="showTooltip(node, $event)"
        @keydown.esc="hideTooltip"
      >
        <circle
          class="node-circle"
          :cx="node.x"
          :cy="node.y"
          :r="node.r"
          :fill="node.fill"
          :stroke="node.stroke ?? '#3e2f57'"
          :stroke-width="node.strokeWidth ?? 2"
        />

        <text
          :x="node.x"
          :y="node.y + node.textOffset"
          text-anchor="middle"
          :fill="node.textColor ?? '#2b1d3f'"
          :class="['node-text', `node-${node.size}`]"
        >
          {{ node.value }}
        </text>
      </g>
    </svg>

    <Transition name="tooltip-fade">
      <div
        v-if="tooltip && activeArcana"
        class="arcana-tooltip"
        id="arcana-tooltip"
        data-testid="arcana-tooltip"
        :class="`is-${tooltip.placement}`"
        :style="tooltipStyle"
        role="tooltip"
      >
        <span class="tooltip-eyebrow">Arcano {{ tooltip.node.value }}</span>
        <strong>{{ activeArcana.name }}</strong>
        <span class="tooltip-keyword">{{ activeArcana.keyword }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Anchor = 'start' | 'middle' | 'end'

type Point = {
  x: number
  y: number
}

type AgeMainLabel = {
  id: string
  x: number
  y: number
  lines: string[]
  anchor: Anchor
}

type AgeTickItem = {
  id: string
  t: number
  arcana: number
  ageText: string
}

type AgeSegment = {
  id: string
  from: Point
  to: Point
  ticks: AgeTickItem[]
}

type RenderedAgeTick = {
  id: string
  x: number
  y: number
  angle: number
  arcana: number
  ageText: string
}

type LineSegment = {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
}

type NodeSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

type MatrixNode = {
  id: string
  x: number
  y: number
  r: number
  value: number
  fill: string
  hoverFill: string
  size: NodeSize
  textOffset: number
  stroke?: string
  strokeWidth?: number
  textColor?: string
}

type ArcanaDetails = {
  name: string
  keyword: string
}

type TooltipPlacement = 'above' | 'below'

type TooltipState = {
  node: MatrixNode
  x: number
  y: number
  placement: TooltipPlacement
}

const arcanaDetails: Record<number, ArcanaDetails> = {
  1: { name: 'O Mago', keyword: 'iniciativa e manifestação' },
  2: { name: 'A Sacerdotisa', keyword: 'intuição e sabedoria interior' },
  3: { name: 'A Imperatriz', keyword: 'criatividade e abundância' },
  4: { name: 'O Imperador', keyword: 'estrutura e autoridade' },
  5: { name: 'O Hierofante', keyword: 'tradição e aprendizado' },
  6: { name: 'Os Enamorados', keyword: 'escolhas e vínculos' },
  7: { name: 'O Carro', keyword: 'direção e conquista' },
  8: { name: 'A Justiça', keyword: 'equilíbrio e verdade' },
  9: { name: 'O Eremita', keyword: 'sabedoria e introspecção' },
  10: { name: 'A Roda da Fortuna', keyword: 'ciclos e movimento' },
  11: { name: 'A Força', keyword: 'coragem e poder pessoal' },
  12: { name: 'O Enforcado', keyword: 'pausa e nova perspectiva' },
  13: { name: 'A Morte', keyword: 'transformação e renascimento' },
  14: { name: 'A Temperança', keyword: 'harmonia e cura' },
  15: { name: 'O Diabo', keyword: 'desejo e libertação' },
  16: { name: 'A Torre', keyword: 'ruptura e revelação' },
  17: { name: 'A Estrela', keyword: 'esperança e inspiração' },
  18: { name: 'A Lua', keyword: 'mistério e sensibilidade' },
  19: { name: 'O Sol', keyword: 'vitalidade e clareza' },
  20: { name: 'O Julgamento', keyword: 'despertar e chamado' },
  21: { name: 'O Mundo', keyword: 'realização e plenitude' },
  22: { name: 'O Louco', keyword: 'liberdade e novos caminhos' }
}

const palette = {
  amethyst: '#7e22ce',
  amethystGlow: '#c084fc',
  wine: '#9f1239',
  wineGlow: '#fb7185',
  rose: '#be185d',
  roseGlow: '#f472b6',
  indigo: '#4338ca',
  indigoGlow: '#818cf8',
  turquoise: '#0f9f8f',
  turquoiseGlow: '#5eead4',
  gold: '#d6a84b',
  goldGlow: '#fde68a',
  amber: '#c77b12',
  amberGlow: '#fbbf24',
  parchment: '#fff9ed',
  lavender: '#ede9fe',
  ink: '#2b1d3f',
  lightText: '#fffaf5'
} as const

const octagonVertices = {
  top: { x: 350, y: 95 },
  upperRight: { x: 530, y: 170 },
  right: { x: 605, y: 350 },
  lowerRight: { x: 530, y: 530 },
  bottom: { x: 350, y: 605 },
  lowerLeft: { x: 170, y: 530 },
  left: { x: 95, y: 350 },
  upperLeft: { x: 170, y: 170 }
}

const octagonPoints = '350,95 530,170 605,350 530,530 350,605 170,530 95,350 170,170'
const squarePoints = '170,170 530,170 530,530 170,530'
const diamondPoints = '350,95 605,350 350,605 95,350'

const ageMainLabels: AgeMainLabel[] = [
  { id: 'age-20', x: 350, y: 45, lines: ['20', 'anos'], anchor: 'middle' },
  { id: 'age-40', x: 638, y: 347, lines: ['40', 'anos'], anchor: 'start' },
  { id: 'age-60', x: 350, y: 647, lines: ['60', 'anos'], anchor: 'middle' },
  { id: 'age-0', x: 62, y: 347, lines: ['0', 'anos'], anchor: 'end' },

  { id: 'age-10', x: 138, y: 130, lines: ['10', 'anos'], anchor: 'middle' },
  { id: 'age-30', x: 562, y: 130, lines: ['30', 'anos'], anchor: 'middle' },
  { id: 'age-50', x: 562, y: 567, lines: ['50', 'anos'], anchor: 'middle' },
  { id: 'age-70', x: 138, y: 567, lines: ['70', 'anos'], anchor: 'middle' }
]

const ageSegments: AgeSegment[] = [
  {
    id: 'top-left-edge',
    from: octagonVertices.upperLeft,
    to: octagonVertices.top,
    ticks: [
      { id: 'a1', t: 0.1, arcana: 6, ageText: '11-12.5' },
      { id: 'a2', t: 0.28, arcana: 15, ageText: '12.5-13.5' },
      { id: 'a3', t: 0.45, arcana: 11, ageText: '13.5-14' },
      { id: 'a4', t: 0.62, arcana: 4, ageText: '14-15' },
      { id: 'a5', t: 0.78, arcana: 20, ageText: '16-17.5' },
      { id: 'a6', t: 0.92, arcana: 11, ageText: '17.5-18.5' }
    ]
  },
  {
    id: 'top-right-edge',
    from: octagonVertices.top,
    to: octagonVertices.upperRight,
    ticks: [
      { id: 'b1', t: 0.1, arcana: 17, ageText: '21-22.5' },
      { id: 'b2', t: 0.28, arcana: 8, ageText: '22.5-23.5' },
      { id: 'b3', t: 0.45, arcana: 7, ageText: '23.5-24' },
      { id: 'b4', t: 0.62, arcana: 17, ageText: '26-27.5' },
      { id: 'b5', t: 0.78, arcana: 6, ageText: '27.5-28.5' },
      { id: 'b6', t: 0.92, arcana: 15, ageText: '28.5-29' }
    ]
  },
  {
    id: 'right-upper-edge',
    from: octagonVertices.upperRight,
    to: octagonVertices.right,
    ticks: [
      { id: 'c1', t: 0.12, arcana: 5, ageText: '31-32.5' },
      { id: 'c2', t: 0.3, arcana: 15, ageText: '32.5-33.5' },
      { id: 'c3', t: 0.48, arcana: 22, ageText: '33.5-34' },
      { id: 'c4', t: 0.66, arcana: 7, ageText: '35 years old' },
      { id: 'c5', t: 0.84, arcana: 13, ageText: '36-37.5' }
    ]
  },
  {
    id: 'right-lower-edge',
    from: octagonVertices.right,
    to: octagonVertices.lowerRight,
    ticks: [
      { id: 'd1', t: 0.12, arcana: 6, ageText: '41-42.5' },
      { id: 'd2', t: 0.3, arcana: 7, ageText: '42.5-43.5' },
      { id: 'd3', t: 0.48, arcana: 15, ageText: '43.5-44' },
      { id: 'd4', t: 0.66, arcana: 8, ageText: '45 years old' },
      { id: 'd5', t: 0.84, arcana: 17, ageText: '46-47.5' }
    ]
  },
  {
    id: 'bottom-right-edge',
    from: octagonVertices.lowerRight,
    to: octagonVertices.bottom,
    ticks: [
      { id: 'e1', t: 0.14, arcana: 19, ageText: '51-52.5' },
      { id: 'e2', t: 0.34, arcana: 3, ageText: '52.5-53.5' },
      { id: 'e3', t: 0.54, arcana: 11, ageText: '53.5-54' },
      { id: 'e4', t: 0.74, arcana: 21, ageText: '56-57.5' }
    ]
  },
  {
    id: 'bottom-left-edge',
    from: octagonVertices.bottom,
    to: octagonVertices.lowerLeft,
    ticks: [
      { id: 'f1', t: 0.16, arcana: 4, ageText: '61-62.5' },
      { id: 'f2', t: 0.34, arcana: 18, ageText: '62.5-63.5' },
      { id: 'f3', t: 0.52, arcana: 14, ageText: '63.5-64' },
      { id: 'f4', t: 0.7, arcana: 11, ageText: '65 years old' },
      { id: 'f5', t: 0.88, arcana: 7, ageText: '66-67.5' }
    ]
  },
  {
    id: 'left-lower-edge',
    from: octagonVertices.lowerLeft,
    to: octagonVertices.left,
    ticks: [
      { id: 'g1', t: 0.14, arcana: 8, ageText: '71-72.5' },
      { id: 'g2', t: 0.34, arcana: 13, ageText: '72.5-73.5' },
      { id: 'g3', t: 0.54, arcana: 5, ageText: '73.5-74' },
      { id: 'g4', t: 0.74, arcana: 21, ageText: '75 years old' },
      { id: 'g5', t: 0.9, arcana: 9, ageText: '76-77.5' }
    ]
  },
  {
    id: 'left-upper-edge',
    from: octagonVertices.left,
    to: octagonVertices.upperLeft,
    ticks: [
      { id: 'h1', t: 0.12, arcana: 15, ageText: '1-2.5' },
      { id: 'h2', t: 0.3, arcana: 19, ageText: '2.5-3.5' },
      { id: 'h3', t: 0.48, arcana: 4, ageText: '3.5-4' },
      { id: 'h4', t: 0.66, arcana: 10, ageText: '5 years old' },
      { id: 'h5', t: 0.84, arcana: 8, ageText: '6-7.5' }
    ]
  }
]

const structureLines: LineSegment[] = [
  { id: 'vertical', x1: 350, y1: 95, x2: 350, y2: 605 },
  { id: 'horizontal', x1: 95, y1: 350, x2: 605, y2: 350 },

  { id: 'square-diag-a', x1: 170, y1: 170, x2: 530, y2: 530 },
  { id: 'square-diag-b', x1: 530, y1: 170, x2: 170, y2: 530 },

  { id: 'tl-link', x1: 205, y1: 205, x2: 170, y2: 170 },
  { id: 'tr-link', x1: 495, y1: 205, x2: 530, y2: 170 },
  { id: 'bl-link', x1: 205, y1: 495, x2: 170, y2: 530 },
  { id: 'br-link', x1: 495, y1: 495, x2: 530, y2: 530 }
]

const nodes: MatrixNode[] = [
  {
    id: 'top',
    x: 350,
    y: 95,
    r: 30,
    value: 9,
    fill: palette.amethyst,
    hoverFill: palette.amethystGlow,
    textColor: palette.lightText,
    size: 'xl',
    textOffset: 10
  },
  {
    id: 'right',
    x: 605,
    y: 350,
    r: 30,
    value: 17,
    fill: palette.rose,
    hoverFill: palette.roseGlow,
    textColor: palette.lightText,
    size: 'xl',
    textOffset: 10
  },
  {
    id: 'bottom',
    x: 350,
    y: 605,
    r: 30,
    value: 10,
    fill: palette.wine,
    hoverFill: palette.wineGlow,
    textColor: palette.lightText,
    size: 'xl',
    textOffset: 10
  },
  {
    id: 'left',
    x: 95,
    y: 350,
    r: 30,
    value: 11,
    fill: palette.amethyst,
    hoverFill: palette.amethystGlow,
    textColor: palette.lightText,
    size: 'xl',
    textOffset: 10
  },

  {
    id: 'top-left',
    x: 170,
    y: 170,
    r: 28,
    value: 20,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'lg',
    textOffset: 8
  },
  {
    id: 'top-right',
    x: 530,
    y: 170,
    r: 28,
    value: 8,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'lg',
    textOffset: 8
  },
  {
    id: 'bottom-right',
    x: 530,
    y: 530,
    r: 28,
    value: 9,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'lg',
    textOffset: 8
  },
  {
    id: 'bottom-left',
    x: 170,
    y: 530,
    r: 28,
    value: 21,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'lg',
    textOffset: 8
  },

  {
    id: 'top-blue',
    x: 350,
    y: 145,
    r: 20,
    value: 11,
    fill: palette.indigo,
    hoverFill: palette.indigoGlow,
    stroke: palette.indigo,
    textColor: palette.lightText,
    size: 'md',
    textOffset: 7
  },
  {
    id: 'top-small',
    x: 350,
    y: 180,
    r: 14,
    value: 20,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'sm',
    textOffset: 5
  },
  {
    id: 'top-green',
    x: 350,
    y: 260,
    r: 14,
    value: 4,
    fill: palette.turquoise,
    hoverFill: palette.turquoiseGlow,
    stroke: palette.turquoise,
    textColor: palette.lightText,
    size: 'sm',
    textOffset: 5
  },

  {
    id: 'left-blue',
    x: 140,
    y: 350,
    r: 20,
    value: 6,
    fill: palette.indigo,
    hoverFill: palette.indigoGlow,
    stroke: palette.indigo,
    textColor: palette.lightText,
    size: 'md',
    textOffset: 7
  },
  {
    id: 'left-small',
    x: 175,
    y: 350,
    r: 14,
    value: 22,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'sm',
    textOffset: 5
  },
  {
    id: 'left-green',
    x: 255,
    y: 350,
    r: 14,
    value: 6,
    fill: palette.turquoise,
    hoverFill: palette.turquoiseGlow,
    stroke: palette.turquoise,
    textColor: palette.lightText,
    size: 'sm',
    textOffset: 5
  },

  {
    id: 'center',
    x: 350,
    y: 350,
    r: 34,
    value: 11,
    fill: palette.gold,
    hoverFill: palette.goldGlow,
    stroke: palette.gold,
    size: 'xxl',
    textOffset: 12
  },

  {
    id: 'mid-13',
    x: 400,
    y: 350,
    r: 19,
    value: 13,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'md',
    textOffset: 6
  },
  {
    id: 'mid-6',
    x: 430,
    y: 350,
    r: 17,
    value: 6,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'md',
    textOffset: 6
  },

  {
    id: 'right-orange',
    x: 520,
    y: 350,
    r: 14,
    value: 10,
    fill: palette.amber,
    hoverFill: palette.amberGlow,
    stroke: palette.amber,
    textColor: palette.lightText,
    size: 'sm',
    textOffset: 5
  },
  {
    id: 'right-small',
    x: 555,
    y: 350,
    r: 19,
    value: 9,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'md',
    textOffset: 6
  },

  {
    id: 'bottom-orange',
    x: 350,
    y: 520,
    r: 14,
    value: 21,
    fill: palette.amber,
    hoverFill: palette.amberGlow,
    stroke: palette.amber,
    textColor: palette.lightText,
    size: 'sm',
    textOffset: 5
  },
  {
    id: 'bottom-small',
    x: 350,
    y: 555,
    r: 19,
    value: 4,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'md',
    textOffset: 6
  },

  {
    id: 'inner-tl-8',
    x: 205,
    y: 205,
    r: 20,
    value: 8,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'md',
    textOffset: 6
  },
  {
    id: 'inner-tl-6',
    x: 230,
    y: 230,
    r: 14,
    value: 6,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'sm',
    textOffset: 5
  },

  {
    id: 'inner-tr-11',
    x: 495,
    y: 205,
    r: 20,
    value: 11,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'md',
    textOffset: 6
  },
  {
    id: 'inner-tr-21',
    x: 470,
    y: 230,
    r: 14,
    value: 21,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'sm',
    textOffset: 5
  },

  {
    id: 'inner-bl-10',
    x: 205,
    y: 495,
    r: 19,
    value: 10,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'md',
    textOffset: 6
  },
  {
    id: 'inner-bl-7',
    x: 230,
    y: 475,
    r: 14,
    value: 7,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'sm',
    textOffset: 5
  },

  {
    id: 'inner-bottom-7',
    x: 395,
    y: 480,
    r: 14,
    value: 7,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'sm',
    textOffset: 5
  },
  {
    id: 'inner-br-14',
    x: 480,
    y: 395,
    r: 14,
    value: 14,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'sm',
    textOffset: 5
  },
  {
    id: 'inner-br-4a',
    x: 440,
    y: 440,
    r: 14,
    value: 4,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'sm',
    textOffset: 5
  },
  {
    id: 'inner-br-22',
    x: 470,
    y: 470,
    r: 14,
    value: 22,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'sm',
    textOffset: 5
  },
  {
    id: 'inner-br-4b',
    x: 495,
    y: 495,
    r: 19,
    value: 4,
    fill: palette.parchment,
    hoverFill: palette.lavender,
    size: 'md',
    textOffset: 6
  }
]

const chartShell = ref<HTMLElement | null>(null)
const tooltip = ref<TooltipState | null>(null)

const activeArcana = computed(() => {
  if (!tooltip.value) return null
  return arcanaDetails[tooltip.value.node.value] ?? null
})

const tooltipStyle = computed<Record<string, string>>(() => {
  if (!tooltip.value) return {} as Record<string, string>

  return {
    left: `${tooltip.value.x}px`,
    top: `${tooltip.value.y}px`,
    '--tooltip-accent': tooltip.value.node.hoverFill
  }
})

function nodeStyle(node: MatrixNode): Record<string, string> {
  return {
    '--node-color': node.fill,
    '--node-hover': node.hoverFill
  }
}

function showTooltip(node: MatrixNode, event: MouseEvent | FocusEvent | KeyboardEvent): void {
  const shell = chartShell.value
  const target = event.currentTarget as SVGGElement | null

  if (!shell || !target) return

  const shellRect = shell.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const tooltipHalfWidth = 98
  const centerX = targetRect.left + targetRect.width / 2 - shellRect.left
  const top = targetRect.top - shellRect.top
  const bottom = targetRect.bottom - shellRect.top
  const placement: TooltipPlacement = top > 100 ? 'above' : 'below'

  tooltip.value = {
    node,
    x: Math.min(Math.max(centerX, tooltipHalfWidth), shellRect.width - tooltipHalfWidth),
    y: placement === 'above' ? top - 12 : bottom + 12,
    placement
  }
}

function hideTooltip(): void {
  tooltip.value = null
}

function pointOnSegment(a: Point, b: Point, t: number): Point {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t
  }
}

function segmentAngle(a: Point, b: Point): number {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
}

function outwardNormal(a: Point, b: Point): Point {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1

  return {
    x: dy / len,
    y: -dx / len
  }
}

const renderedAgeTicks = computed<RenderedAgeTick[]>(() => {
  const offset = 24

  return ageSegments.flatMap((segment) => {
    const angle = segmentAngle(segment.from, segment.to)
    const normal = outwardNormal(segment.from, segment.to)

    return segment.ticks.map((tick) => {
      const base = pointOnSegment(segment.from, segment.to, tick.t)

      return {
        id: `${segment.id}-${tick.id}`,
        x: base.x + normal.x * offset,
        y: base.y + normal.y * offset,
        angle,
        arcana: tick.arcana,
        ageText: tick.ageText
      }
    })
  })
})
</script>

<style scoped>
.destiny-matrix-shell {
  position: relative;
  isolation: isolate;
  width: 100%;
  max-width: 560px;
}

.destiny-matrix {
  width: 100%;
  height: auto;
  display: block;
  color: #2b1d3f;
}

.structure-lines line {
  stroke: #4d3b66;
  stroke-width: 1.4;
  stroke-opacity: 0.82;
}

.male-line {
  stroke: #6d28d9;
  stroke-width: 2;
}

.female-line {
  stroke: #db2777;
  stroke-width: 2;
}

.dashed-line {
  stroke: #9b87b5;
  stroke-width: 1.2;
  stroke-dasharray: 5 7;
}

.line-label {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.15px;
  fill: #5d426f;
  stroke: #faf6ff;
  stroke-width: 4px;
  paint-order: stroke fill;
}

.love-icon {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 22px;
  font-weight: 700;
  fill: #db2777;
}

.money-icon {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 22px;
  font-weight: 700;
  fill: #0f9f8f;
}

.age-main text {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 8px;
  font-weight: 700;
  fill: #49365f;
}

.edge-ticks {
  pointer-events: none;
}

.edge-arcana {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 8px;
  font-weight: 700;
  fill: #49365f;
}

.edge-age {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 6.4px;
  fill: #75658a;
}

.matrix-node {
  cursor: pointer;
  outline: none;
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 180ms ease;
}

.node-circle {
  fill: var(--node-color);
  transition:
    fill 180ms ease,
    stroke 180ms ease,
    stroke-width 180ms ease,
    filter 180ms ease;
}

.matrix-node:hover,
.matrix-node:focus-visible,
.matrix-node.is-active {
  transform: scale(1.08);
}

.matrix-node:hover .node-circle,
.matrix-node:focus-visible .node-circle,
.matrix-node.is-active .node-circle {
  fill: var(--node-hover);
  stroke: var(--node-hover);
  stroke-width: 3;
  filter: drop-shadow(0 0 10px var(--node-hover));
}

.node-text {
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 700;
  pointer-events: none;
  transition: fill 180ms ease;
}

.node-sm {
  font-size: 13px;
}

.node-md {
  font-size: 18px;
}

.node-lg {
  font-size: 24px;
}

.node-xl {
  font-size: 28px;
}

.node-xxl {
  font-size: 30px;
}

.arcana-tooltip {
  --tooltip-accent: #c084fc;

  position: absolute;
  z-index: 5;
  width: 196px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 12px 14px 13px;
  border: 1px solid var(--tooltip-accent);
  border-radius: 15px;
  text-align: left;
  color: #fffaf5;
  background: linear-gradient(135deg, rgb(38 20 58 / 97%), rgb(83 35 105 / 96%));
  box-shadow:
    0 16px 36px rgb(43 19 66 / 28%),
    0 0 22px color-mix(in srgb, var(--tooltip-accent) 35%, transparent);
  pointer-events: none;
}

.arcana-tooltip.is-above {
  transform: translate(-50%, -100%);
}

.arcana-tooltip.is-below {
  transform: translate(-50%, 0);
}

.arcana-tooltip::after {
  content: '';
  position: absolute;
  left: 50%;
  width: 10px;
  height: 10px;
  border: solid var(--tooltip-accent);
  background: #4d2468;
  transform: translateX(-50%) rotate(45deg);
}

.arcana-tooltip.is-above::after {
  bottom: -6px;
  border-width: 0 1px 1px 0;
}

.arcana-tooltip.is-below::after {
  top: -6px;
  border-width: 1px 0 0 1px;
}

.tooltip-eyebrow {
  font:
    700 10px/1.2 Arial,
    Helvetica,
    sans-serif;
  letter-spacing: 1.15px;
  text-transform: uppercase;
  color: var(--tooltip-accent);
}

.arcana-tooltip strong {
  font:
    700 18px/1.2 Georgia,
    'Times New Roman',
    serif;
  letter-spacing: 0.1px;
}

.tooltip-keyword {
  font:
    500 11px/1.35 Arial,
    Helvetica,
    sans-serif;
  color: #e9ddf5;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition:
    opacity 150ms ease,
    transform 150ms ease;
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
  .matrix-node,
  .node-circle,
  .node-text,
  .tooltip-fade-enter-active,
  .tooltip-fade-leave-active {
    transition: none;
  }
}
</style>
