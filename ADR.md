# Registros de decisões arquiteturais

Este projeto registra decisões técnicas relevantes em
[`docs/adr`](docs/adr/README.md).

## Decisões atuais

| ADR                                                                        | Decisão                                                   | Status |
| -------------------------------------------------------------------------- | --------------------------------------------------------- | ------ |
| [0001](docs/adr/0001-dominio-astrologico-compartilhado.md)                 | Um único domínio de tipos para mapa natal e carta horária | Aceita |
| [0002](docs/adr/0002-componentes-svg-data-driven.md)                       | Componentes SVG orientados por dados                      | Aceita |
| [0003](docs/adr/0003-vue-como-peer-dependency.md)                          | Vue como peer dependency do pacote                        | Aceita |
| [0004](docs/adr/0004-astrocartografia-separa-efemerides-e-renderizacao.md) | Efemérides fora do runtime da astrocartografia            | Aceita |

## Quando criar um ADR

Crie um novo registro quando uma decisão:

- alterar a API pública;
- adicionar uma dependência de produção;
- mudar o formato dos dados astrológicos;
- afetar todos os componentes;
- impuser uma restrição difícil de reverter.

Não reescreva decisões aceitas. Quando uma decisão mudar, crie um novo ADR que
substitua explicitamente o anterior.
