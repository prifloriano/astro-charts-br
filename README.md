# astro-charts-br

[![npm version](https://img.shields.io/npm/v/astro-charts-br?color=8b5cf6&label=npm)](https://www.npmjs.com/package/astro-charts-br)
[![npm downloads](https://img.shields.io/npm/dm/astro-charts-br?color=14b8a6)](https://www.npmjs.com/package/astro-charts-br)
[![license](https://img.shields.io/npm/l/astro-charts-br?color=f59e0b)](LICENSE)
[![CI](https://github.com/prifloriano/astro-charts-br/actions/workflows/ci.yml/badge.svg)](https://github.com/prifloriano/astro-charts-br/actions/workflows/ci.yml)
[![Vue 3](https://img.shields.io/badge/Vue-3.5+-42b883?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Biblioteca Vue 3 de componentes visuais para astrologia, astrocartografia e
sistemas simbólicos em português.

O pacote foi desenhado para apps que já têm seus próprios cálculos, APIs ou
regras de negócio. A biblioteca renderiza gráficos bonitos, responsivos e
acessíveis; ela não consulta efemérides, não chama APIs externas e não produz
interpretações automaticamente.

## Componentes disponíveis

| Componente            | Uso principal                                             |
| --------------------- | --------------------------------------------------------- |
| `NatalChartWheel`     | Mandala de mapa astral natal                              |
| `HoraryChartWheel`    | Carta de astrologia horária com pergunta e significadores |
| `AstrocartographyMap` | Mapa-múndi de linhas astrocartográficas angulares         |
| `DestinyMatrixChart`  | Matriz do Destino com arcanos e tooltips                  |

Também são exportados tipos TypeScript, catálogo de glifos astrológicos e o
utilitário `buildAstrocartographyLines`.

## Requisitos

- Vue `^3.5.0`
- Node.js `>=20` para desenvolvimento/build do pacote
- Projeto consumidor com suporte a ESM, como Vite, Nuxt, Astro ou similar

## Instalação em um app Vue via npm

```bash
npm install astro-charts-br vue
```

Ou, se você usa outro gerenciador:

```bash
pnpm add astro-charts-br vue
yarn add astro-charts-br vue
```

Importe o CSS uma única vez no ponto de entrada do app.

```ts
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import 'astro-charts-br/style.css'

createApp(App).mount('#app')
```

Depois importe os componentes diretamente nos seus arquivos `.vue`.

```vue
<template>
  <NatalChartWheel :chart="chart" />
</template>

<script setup lang="ts">
import { NatalChartWheel } from 'astro-charts-br'
import type { NatalChartData } from 'astro-charts-br'

const chart: NatalChartData = {
  angles: {
    ascendant: 212.5,
    midheaven: 122.5
  },
  houses: [
    { house: 1, longitude: 212.5 },
    { house: 2, longitude: 244.5 },
    { house: 3, longitude: 278.5 },
    { house: 4, longitude: 302.5 },
    { house: 5, longitude: 330.5 },
    { house: 6, longitude: 2.5 },
    { house: 7, longitude: 32.5 },
    { house: 8, longitude: 64.5 },
    { house: 9, longitude: 98.5 },
    { house: 10, longitude: 122.5 },
    { house: 11, longitude: 150.5 },
    { house: 12, longitude: 182.5 }
  ],
  bodies: [
    { id: 'sun', name: 'Sol', longitude: 186.8, kind: 'planet' },
    { id: 'moon', name: 'Lua', longitude: 63.2, kind: 'planet' },
    { id: 'saturn', name: 'Saturno', longitude: 267.4, kind: 'planet', retrograde: true }
  ]
}
</script>
```

## Convenção de dados astrológicos

Os componentes de mandala usam longitude eclíptica absoluta em graus.

| Longitude | Significado     |
| --------- | --------------- |
| `0`       | 0° de Áries     |
| `30`      | 0° de Touro     |
| `180`     | 0° de Libra     |
| `359.999` | final de Peixes |

Exemplo: `225.375` corresponde a `15°22′30″ de Escorpião`.

O componente posiciona o grau real do Ascendente à esquerda da roda e rotaciona
o zodíaco a partir dele. As casas podem ter tamanhos diferentes, então cada
cúspide deve ser informada pela aplicação consumidora.

## O que o app consumidor precisa fornecer

A biblioteca espera dados já calculados:

- Ascendente, Meio do Céu e cúspides das casas;
- posições dos corpos, pontos e asteroides;
- aspectos, se você quiser controlar manualmente as linhas;
- posições equatoriais e tempo sideral para gerar astrocartografia;
- textos de pergunta, leitura ou metadados quando usar carta horária.

Ela não faz:

- cálculo de efemérides;
- conversão de data, local e hora para posições;
- correção de fuso histórico;
- cálculo de casas;
- interpretação de mapa;
- chamada de API.

Essa separação mantém a biblioteca leve, genérica e segura para qualquer produto
usar.

## Glifos automáticos

O dev que usa a biblioteca não precisa ficar passando glifo manualmente para
corpos conhecidos. A biblioteca identifica símbolos por `symbol`, `id` ou
`name`, inclusive com nomes em português e inglês.

```ts
{
  id: 'chiron',
  name: 'Quíron',
  longitude: 116.73,
  kind: 'point'
}
```

Se o `id` for interno ao seu sistema, use `symbol` para indicar o corpo real.

```ts
{
  id: 'regente-casa-7',
  symbol: 'saturn',
  name: 'Regente da casa 7',
  longitude: 318.9,
  kind: 'planet'
}
```

`glyph` e `shortLabel` continuam disponíveis como sobrescritas quando o app
precisar de um símbolo específico.

## Tooltips e mobile

Os tooltips foram pensados para mouse, teclado e toque:

- desktop: passar o mouse abre o tooltip;
- mobile/tablet: tocar no corpo ou linha abre o tooltip;
- teclado: foco + `Enter` ou `Espaço` abre quando disponível;
- `Esc` fecha o tooltip;
- tocar fora do gráfico fecha o tooltip.

## Mapa astral natal

```vue
<template>
  <NatalChartWheel
    :chart="chart"
    :max-width="760"
    :show-degree-ticks="true"
    :show-house-numbers="true"
    :auto-aspects="true"
  />
</template>

<script setup lang="ts">
import { NatalChartWheel } from 'astro-charts-br'
import type { NatalAspect, NatalChartData } from 'astro-charts-br'

const aspects: NatalAspect[] = [
  { sourceId: 'sun', targetId: 'moon', type: 'trine', orb: 1.2 },
  { sourceId: 'mars', targetId: 'saturn', type: 'square', orb: 0.8 }
]

const chart: NatalChartData = {
  angles: { ascendant: 212.5, midheaven: 122.5 },
  houses: [
    { house: 1, longitude: 212.5 },
    { house: 2, longitude: 244.5 },
    { house: 3, longitude: 278.5 },
    { house: 4, longitude: 302.5 },
    { house: 5, longitude: 330.5 },
    { house: 6, longitude: 2.5 },
    { house: 7, longitude: 32.5 },
    { house: 8, longitude: 64.5 },
    { house: 9, longitude: 98.5 },
    { house: 10, longitude: 122.5 },
    { house: 11, longitude: 150.5 },
    { house: 12, longitude: 182.5 }
  ],
  bodies: [
    { id: 'sun', name: 'Sol', longitude: 186.8, kind: 'planet' },
    { id: 'moon', name: 'Lua', longitude: 63.2, kind: 'planet' },
    { id: 'mercury', name: 'Mercúrio', longitude: 204.1, kind: 'planet' },
    { id: 'venus', name: 'Vênus', longitude: 158.4, kind: 'planet' },
    { id: 'mars', name: 'Marte', longitude: 6.2, kind: 'planet' },
    { id: 'saturn', name: 'Saturno', longitude: 267.4, kind: 'planet', retrograde: true }
  ],
  aspects
}
</script>
```

### Props

| Prop               | Tipo             | Padrão      | Descrição                                             |
| ------------------ | ---------------- | ----------- | ----------------------------------------------------- |
| `chart`            | `NatalChartData` | obrigatório | Dados completos do mapa                               |
| `maxWidth`         | `number`         | `760`       | Largura máxima do SVG                                 |
| `showDegreeTicks`  | `boolean`        | `true`      | Mostra marcações de grau                              |
| `showHouseNumbers` | `boolean`        | `true`      | Mostra número das casas                               |
| `autoAspects`      | `boolean`        | `true`      | Calcula aspectos maiores quando `chart.aspects` falta |

Se `chart.aspects` for omitido e `autoAspects` estiver ativo, o componente
calcula conjunção, sextil, quadratura, trígono e oposição. Se `chart.aspects`
for `[]`, nenhuma linha de aspecto é desenhada.

## Astrologia horária

`HoraryChartWheel` reutiliza o mesmo domínio do mapa natal e adiciona campos
específicos da pergunta horária: significadores, movimento do aspecto,
perfeição e leitura opcional.

```vue
<template>
  <HoraryChartWheel :chart="horaryChart" :max-width="1120" />
</template>

<script setup lang="ts">
import { HoraryChartWheel } from 'astro-charts-br'
import type { HoraryChartData } from 'astro-charts-br'

const horaryChart: HoraryChartData = {
  question: 'Essa situação vai avançar?',
  askedAtLabel: '04/07/2026, 20:44',
  locationLabel: 'Curitiba, PR',
  houseSystemLabel: 'Regiomontanus',
  angles: { ascendant: 104.2, midheaven: 12.6 },
  houses: [
    { house: 1, longitude: 104.2 },
    { house: 2, longitude: 132.8 },
    { house: 3, longitude: 164.6 },
    { house: 4, longitude: 192.6 },
    { house: 5, longitude: 222.4 },
    { house: 6, longitude: 254.9 },
    { house: 7, longitude: 284.2 },
    { house: 8, longitude: 312.8 },
    { house: 9, longitude: 344.6 },
    { house: 10, longitude: 12.6 },
    { house: 11, longitude: 42.4 },
    { house: 12, longitude: 74.9 }
  ],
  bodies: [
    { id: 'moon', name: 'Lua', longitude: 138.4, kind: 'planet', role: 'moon' },
    { id: 'mercury', name: 'Mercúrio', longitude: 129.1, kind: 'planet', role: 'querent' },
    {
      id: 'saturn',
      name: 'Saturno',
      longitude: 318.9,
      kind: 'planet',
      retrograde: true,
      role: 'quesited'
    }
  ],
  aspects: [
    {
      sourceId: 'moon',
      targetId: 'saturn',
      type: 'opposition',
      orb: 0.5,
      motion: 'applying',
      perfection: true
    }
  ],
  reading: {
    answerLabel: 'Resposta mista',
    answerTone: 'mixed',
    summary: 'Há contato entre significadores, mas com tensão e necessidade de ajuste.',
    significators: [
      { role: 'Consulente', bodyId: 'mercury', note: 'Regente do Ascendente.' },
      { role: 'Questão', bodyId: 'saturn', note: 'Regente da casa consultada.' }
    ],
    testimonies: [
      {
        title: 'Lua aplica oposição',
        tone: 'mixed',
        description: 'Existe movimento, mas a oposição indica custo ou negociação.'
      }
    ]
  }
}
</script>
```

### Papéis horários

| Valor      | Uso                          |
| ---------- | ---------------------------- |
| `querent`  | Consulente                   |
| `quesited` | Pessoa, objeto ou tema       |
| `moon`     | Lua como co-significadora    |
| `ruler`    | Regente relevante            |
| `witness`  | Testemunha ou fator de apoio |

O componente apenas apresenta o julgamento. Regras como proibição, frustração,
translação de luz, coleção de luz, recepção e dignidades continuam sendo
responsabilidade do app consumidor ou da API.

## Astrocartografia

`AstrocartographyMap` mostra onde cada planeta estava angular no mundo no
instante informado.

| Linha | Ângulo       | Significado visual                                |
| ----- | ------------ | ------------------------------------------------- |
| `ASC` | Ascendente   | Curva onde o planeta estava surgindo no horizonte |
| `DSC` | Descendente  | Curva onde o planeta estava se pondo              |
| `MC`  | Meio do Céu  | Meridiano onde o planeta estava culminando        |
| `IC`  | Fundo do Céu | Antimeridiano oposto ao MC                        |

```vue
<template>
  <AstrocartographyMap
    :chart="chart"
    :initial-visible-planets="['sun', 'moon', 'venus', 'jupiter']"
    :initial-visible-angles="['ASC', 'MC']"
    @line-select="handleLineSelect"
    @filters-change="handleFiltersChange"
  />
</template>

<script setup lang="ts">
import { AstrocartographyMap, buildAstrocartographyLines } from 'astro-charts-br'
import type {
  AstrocartographyChartData,
  AstrocartographyEquatorialPosition,
  AstrocartographyLineEvent
} from 'astro-charts-br'

const positions: AstrocartographyEquatorialPosition[] = [
  {
    planet: 'sun',
    name: 'Sol',
    rightAscensionHours: 12.4053,
    declinationDegrees: -2.6294
  },
  {
    planet: 'moon',
    name: 'Lua',
    rightAscensionHours: 3.6472,
    declinationDegrees: 24.6858
  }
]

const greenwichApparentSiderealTimeHours = 14.1687401324

const chart: AstrocartographyChartData = {
  title: 'Astrocartografia natal',
  subtitle: 'Linhas planetárias angulares ao redor do mundo',
  momentUtc: '1988-09-29T13:36:00.000Z',
  localDateTimeLabel: '29/09/1988, 10:36',
  timezoneLabel: 'UTC−3',
  birthplace: {
    name: 'Curitiba, PR',
    latitude: -25.43,
    longitude: -49.270833
  },
  lines: buildAstrocartographyLines(positions, greenwichApparentSiderealTimeHours)
}

function handleLineSelect(event: AstrocartographyLineEvent) {
  console.log(event.line.planet, event.line.angle, event.anchor)
}

function handleFiltersChange(filters: { planets: string[]; angles: string[] }) {
  console.log(filters)
}
</script>
```

### Props e eventos

| Prop                    | Tipo                         | Padrão      | Descrição                          |
| ----------------------- | ---------------------------- | ----------- | ---------------------------------- |
| `chart`                 | `AstrocartographyChartData`  | obrigatório | Dados do mapa e linhas             |
| `maxWidth`              | `number`                     | `1200`      | Largura máxima                     |
| `showGrid`              | `boolean`                    | `true`      | Mostra grade de latitude/longitude |
| `showLegend`            | `boolean`                    | `true`      | Mostra filtros de planetas/ângulos |
| `showLabels`            | `boolean`                    | `true`      | Mostra glifos e rótulos nas bordas |
| `initialVisiblePlanets` | `AstrocartographyPlanetId[]` | todos       | Planetas inicialmente visíveis     |
| `initialVisibleAngles`  | `AstrocartographyAngle[]`    | todos       | Ângulos inicialmente visíveis      |

| Evento           | Quando ocorre                                           |
| ---------------- | ------------------------------------------------------- |
| `line-select`    | Clique, toque ou teclado em uma linha astrocartográfica |
| `filters-change` | Alteração dos filtros de planetas ou ângulos            |

Se o backend já entregar as linhas geográficas, você pode ignorar
`buildAstrocartographyLines` e preencher `chart.lines` diretamente.

## Matriz do Destino

```vue
<template>
  <DestinyMatrixChart />
</template>

<script setup lang="ts">
import { DestinyMatrixChart } from 'astro-charts-br'
</script>
```

O componente atual renderiza a matriz visual com tooltips dos arcanos. Ele não
calcula a matriz a partir da data de nascimento; essa etapa pode ficar no app ou
em um serviço externo.

## Tipos públicos

```ts
import type {
  AspectMotion,
  AspectType,
  AstrologicalAspect,
  AstrologicalChartAngles,
  AstrologicalChartBody,
  AstrologicalChartData,
  AstrologicalHouseCusp,
  AstrologicalSymbolId,
  CelestialBodyKind,
  HouseNumber,
  HoraryChartData,
  NatalChartData,
  ZodiacSignId
} from 'astro-charts-br'
```

Também é possível usar o catálogo de glifos fora dos componentes:

```ts
import { ASTROLOGY_GLYPHS, getAstrologyGlyph, resolveAstrologySymbol } from 'astro-charts-br'

getAstrologyGlyph('Saturno') // ♄
resolveAstrologySymbol('Nodo Norte') // north-node
ASTROLOGY_GLYPHS.chiron // ⚷
```

## Desenvolvimento local

```bash
npm install
npm run dev
```

Validação completa:

```bash
npm run check
npm run format:check
```

Build do pacote:

```bash
npm run build
```

Build da demo:

```bash
npm run build:demo
```

Gerar o mapa-base e fixtures de astrocartografia:

```bash
npm run generate:astrocartography
```

## Estrutura do projeto

```text
src/
  components/              Componentes Vue publicados
  core/astrology/          Tipos e glifos astrológicos compartilhados
  core/astrocartography/   Tipos, geometria e mapa-base
  demo/                    Dados fictícios para desenvolvimento local
  index.ts                 API pública do pacote
tests/                     Testes unitários com Vitest
docs/adr/                  Decisões arquiteturais
.github/                   Templates de issue, PR e CI
```

## Publicação no GitHub e npm

Resumo rápido:

```bash
npm run check
npm run format:check
npm pack --dry-run
npm version patch
npm publish --access public
```

O passo a passo completo está em [docs/PUBLISHING.md](docs/PUBLISHING.md).

## Arquitetura

As decisões arquiteturais estão resumidas em [ADR.md](ADR.md) e detalhadas em
[docs/adr](docs/adr/README.md).

## Contribuição

Consulte [CONTRIBUTING.md](CONTRIBUTING.md).

## Segurança

Consulte [SECURITY.md](SECURITY.md).

## Licença

MIT © 2026 Priscila Floriano. Consulte [LICENSE](LICENSE).

Avisos de terceiros relacionados ao mapa-base e ferramentas de geração estão em
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
