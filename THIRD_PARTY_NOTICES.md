# Avisos de terceiros

O componente de astrocartografia inclui uma representação vetorial derivada do
mapa-múndi Natural Earth 1:110m.

## Natural Earth

Os dados do Natural Earth são disponibilizados em domínio público e podem ser
usados em qualquer tipo de projeto:

- <https://www.naturalearthdata.com/about/terms-of-use/>

## Ferramentas de geração

Os pacotes abaixo são usados somente durante o desenvolvimento para gerar o
mapa-base e os dados de demonstração. Eles não são dependências de runtime do
pacote publicado.

| Projeto            | Licença | Uso                                             |
| ------------------ | ------- | ----------------------------------------------- |
| `world-atlas`      | ISC     | Distribuição dos dados Natural Earth 1:110m     |
| `topojson-client`  | ISC     | Conversão de TopoJSON para geometria geográfica |
| `d3-geo`           | ISC     | Projeção e geração dos caminhos SVG             |
| `astronomy-engine` | MIT     | Efemérides da demonstração local                |

Links:

- <https://github.com/topojson/world-atlas>
- <https://github.com/topojson/topojson-client>
- <https://github.com/d3/d3-geo>
- <https://github.com/cosinekitty/astronomy>
