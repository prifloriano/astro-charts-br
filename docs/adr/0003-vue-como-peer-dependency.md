# ADR 0003: Vue como peer dependency

- Status: Aceita
- Data: 2026-07-04

## Contexto

Empacotar uma cópia própria do Vue aumentaria o bundle e poderia criar duas
instâncias do framework na aplicação consumidora.

## Decisão

Vue 3.5 ou superior é declarado como `peerDependency` e externalizado no build
da biblioteca. Vue permanece em `devDependencies` apenas para desenvolvimento,
tipagem e demonstração local.

O pacote publica um módulo ES, declarações TypeScript e um arquivo CSS.

## Consequências

- O bundle publicado fica menor.
- A aplicação consumidora controla a versão compatível do Vue.
- Consumidores devem instalar Vue junto com o pacote.
- A distribuição é moderna e voltada a bundlers com suporte a módulos ES.
