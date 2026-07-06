# ADR 0002: Componentes SVG orientados por dados

- Status: Aceita
- Data: 2026-07-04

## Contexto

A biblioteca deve funcionar com diferentes fornecedores de efemérides e
sistemas de casas. Incorporar cálculos astronômicos ou dados fixos nos
componentes aumentaria o pacote e limitaria sua reutilização.

## Decisão

Os componentes recebem dados já calculados por propriedades e cuidam apenas de:

- projeção geométrica;
- resolução visual de sobreposições;
- desenho de casas, corpos e aspectos;
- acessibilidade e tooltips;
- apresentação responsiva.

Os gráficos são SVGs responsivos. Dados de demonstração ficam em `src/demo` e
não entram na API pública.

## Consequências

- O pacote permanece pequeno e independente de efemérides.
- O consumidor escolhe fonte de dados, sistema de casas e regras de orbe.
- A exatidão astrológica depende dos dados fornecidos pelo consumidor.
- Testes visuais podem usar fixtures determinísticas.
