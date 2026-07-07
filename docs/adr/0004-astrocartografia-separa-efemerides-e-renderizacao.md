# ADR 0004: Separar efemérides e renderização astrocartográfica

- Status: Aceita
- Data: 2026-07-06

## Contexto

Uma astrocartografia depende de duas responsabilidades diferentes:

1. calcular posições planetárias, tempo sideral e conversões de data e fuso;
2. transformar dados astronômicos em linhas geográficas e apresentá-las em um
   mapa interativo.

Embutir um motor de efemérides no pacote aumentaria o tamanho publicado,
vincularia a API a um fornecedor específico e faria a biblioteca assumir
decisões de precisão que pertencem à aplicação consumidora.

## Decisão

`AstrocartographyMap` será um componente de apresentação orientado por dados. A
propriedade `chart.lines` receberá segmentos geográficos prontos, com planeta,
ângulo, cor e coordenadas.

O pacote também oferecerá `buildAstrocartographyLines`, um utilitário geométrico
sem dependências externas em produção. Ele receberá posições equatoriais
geocêntricas — ascensão reta e declinação — e tempo sideral aparente de
Greenwich. A função produzirá linhas `MC`, `IC`, `ASC` e `DSC`, separando
segmentos no antimeridiano.

O mapa-base será gerado durante o desenvolvimento a partir do Natural Earth e
incluído como vetores locais. Astronomy Engine, `world-atlas`, `topojson-client`
e `d3-geo` serão somente dependências de desenvolvimento e não integrarão o
bundle de produção.

## Consequências


- O componente funciona sem rede e sem imagens proprietárias.
- O consumidor pode usar qualquer serviço ou motor de efemérides.
- Não há correção automática de fuso histórico no runtime da biblioteca.
- A aplicação deve garantir que posições equatoriais e tempo sideral
  correspondam ao mesmo instante e modelo astronômico.
- O bundle inclui a geometria vetorial do mapa-múndi, mas não inclui bancos de
  efemérides.
