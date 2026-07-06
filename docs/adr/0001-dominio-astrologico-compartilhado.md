# ADR 0001: Domínio astrológico compartilhado

- Status: Aceita
- Data: 2026-07-04

## Contexto

O mapa natal e a carta horária usam a mesma base geométrica e matemática:
signos, casas, ângulos, corpos, longitudes e aspectos. A primeira implementação
da astrologia horária duplicou esses contratos em `horaryTypes.ts`, criando
risco de divergência e manutenção desnecessária.

## Decisão

Todos os tipos astrológicos comuns ficam em
`src/core/astrology/types.ts`.

Os tipos `Astrological*` representam o núcleo compartilhado. `Natal*` são
aliases especializados para o mapa natal. `Horary*` adicionam somente
informações próprias da astrologia horária, como pergunta, significadores,
movimento do aspecto, perfeição e leitura.

Longitudes são sempre absolutas, de 0° a 360°, com 0° em Áries.

## Consequências

- Mapa natal e carta horária permanecem compatíveis.
- Novos corpos e aspectos são adicionados uma única vez.
- Consumidores podem compartilhar o mesmo serviço de efemérides.
- Alterações no núcleo exigem cuidado com compatibilidade retroativa.
