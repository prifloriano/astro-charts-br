# Architecture Decision Records

Os ADRs documentam o contexto, a decisão e as consequências das escolhas
estruturais do `astro-charts-br`.

## Convenção

- Arquivos numerados sequencialmente.
- Título no formato `NNNN-descricao-curta.md`.
- Status possíveis: Proposta, Aceita, Substituída ou Rejeitada.
- Decisões aceitas são imutáveis; correções factuais pequenas são permitidas.

Use o modelo:

```markdown
# ADR NNNN: Título

- Status: Proposta
- Data: AAAA-MM-DD

## Contexto

## Decisão

## Consequências
```

## Decisões

- [0001 — Domínio astrológico compartilhado](0001-dominio-astrologico-compartilhado.md)
- [0002 — Componentes SVG orientados por dados](0002-componentes-svg-data-driven.md)
- [0003 — Vue como peer dependency](0003-vue-como-peer-dependency.md)
- [0004 — Separar efemérides e renderização astrocartográfica](0004-astrocartografia-separa-efemerides-e-renderizacao.md)
