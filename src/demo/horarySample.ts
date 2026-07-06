import type { HoraryChartData } from '../core/astrology/types'

export const horarySample: HoraryChartData = {
  question: 'Essa situação vai avançar?',
  topicLabel: 'Exemplo genérico',
  askedAtLabel: '04/07/2026, 20:44',
  locationLabel: 'Curitiba, PR',
  houseSystemLabel: 'Regiomontanus',

  angles: {
    ascendant: 104.2,
    descendant: 284.2,
    midheaven: 12.6,
    imumCoeli: 192.6
  },

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
    {
      id: 'sun',
      name: 'Sol',
      longitude: 219.6,
      kind: 'planet',
      color: '#d63847'
    },
    {
      id: 'moon',
      name: 'Lua',
      longitude: 138.4,
      kind: 'planet',
      role: 'querent'
    },
    {
      id: 'mercury',
      name: 'Mercúrio',
      longitude: 190.2,
      kind: 'planet'
    },
    {
      id: 'venus',
      name: 'Vênus',
      longitude: 186.8,
      kind: 'planet'
    },
    {
      id: 'mars',
      name: 'Marte',
      longitude: 228.2,
      kind: 'planet'
    },
    {
      id: 'jupiter',
      name: 'Júpiter',
      longitude: 78.2,
      kind: 'planet'
    },
    {
      id: 'saturn',
      name: 'Saturno',
      longitude: 318.9,
      kind: 'planet',
      retrograde: true,
      role: 'quesited'
    },
    {
      id: 'uranus',
      name: 'Urano',
      longitude: 51,
      kind: 'planet'
    },
    {
      id: 'neptune',
      name: 'Netuno',
      longitude: 356.5,
      kind: 'planet'
    },
    {
      id: 'pluto',
      name: 'Plutão',
      longitude: 296.4,
      kind: 'planet'
    },
    {
      id: 'north-node',
      name: 'Nodo Norte',
      longitude: 17.3,
      kind: 'point',
      retrograde: true
    },
    {
      id: 'fortune',
      name: 'Parte da Fortuna',
      longitude: 247.8,
      kind: 'point'
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
    },
    {
      sourceId: 'moon',
      targetId: 'jupiter',
      type: 'sextile',
      orb: 0.2,
      motion: 'separating'
    },
    {
      sourceId: 'moon',
      targetId: 'mars',
      type: 'square',
      orb: 0.2,
      motion: 'applying'
    },
    {
      sourceId: 'mercury',
      targetId: 'venus',
      type: 'conjunction',
      orb: 3.4,
      motion: 'separating'
    },
    {
      sourceId: 'jupiter',
      targetId: 'saturn',
      type: 'trine',
      orb: 0.7,
      motion: 'applying'
    }
  ],

  reading: {
    answerLabel: 'Tendência mista, com avanço e tensão',
    answerTone: 'mixed',
    summary:
      'A carta mostra movimento, mas não de forma simples. Há contato entre os significadores, porém com oposição e quadratura envolvendo a Lua, indicando avanço com resistência, ruído ou demora.',
    significators: [
      {
        role: 'Consulente',
        bodyId: 'moon',
        note: 'Neste exemplo, a Lua representa quem pergunta e também mostra o andamento emocional da questão.'
      },
      {
        role: 'Assunto perguntado',
        bodyId: 'saturn',
        note: 'Saturno foi marcado como significador do assunto. Por estar retrógrado, sugere revisão, retorno ou atraso.'
      },
      {
        role: 'Testemunha benéfica',
        bodyId: 'jupiter',
        note: 'Júpiter forma aspecto harmônico, funcionando como apoio ou oportunidade de melhora.'
      }
    ],
    testimonies: [
      {
        title: 'Lua aplica oposição a Saturno',
        tone: 'mixed',
        description:
          'Existe contato entre as partes, mas a oposição indica distância, resistência ou necessidade de negociação.'
      },
      {
        title: 'Lua aplica quadratura a Marte',
        tone: 'negative',
        description:
          'A quadratura sugere pressa, conflito, ansiedade ou uma ação que pode gerar desgaste.'
      },
      {
        title: 'Júpiter aplica trígono a Saturno',
        tone: 'positive',
        description:
          'Há uma via de suporte, acordo ou melhora, desde que a situação seja conduzida com maturidade.'
      },
      {
        title: 'Saturno retrógrado',
        tone: 'unclear',
        description:
          'Pode indicar retorno a um tema antigo, reavaliação ou demora antes de uma resposta definitiva.'
      }
    ]
  }
}
