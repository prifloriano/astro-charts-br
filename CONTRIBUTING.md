# Como contribuir

Obrigada pelo interesse em contribuir com o `astro-charts-br`.

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior

## Preparação

```bash
git clone <url-do-repositorio>
cd astro-charts-br
npm install
npm run dev
```

A aplicação de demonstração será aberta pelo Vite e não faz parte do pacote
publicado.

## Verificações obrigatórias

Antes de enviar uma alteração:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm pack --dry-run
```

Ou execute tudo com:

```bash
npm run check
```

Todos os componentes públicos devem continuar importáveis a partir de
`src/index.ts`.

Antes de publicar uma versão, siga também o checklist de
[docs/PUBLISHING.md](docs/PUBLISHING.md).

## Organização do projeto

```text
src/
  components/          Componentes publicados
  core/astrology/      Tipos compartilhados de astrologia
  core/astrocartography/ Tipos e geometria da astrocartografia
  demo/                Dados usados somente no desenvolvimento
  index.ts             API pública do pacote
tests/                 Testes unitários
.github/               Templates e CI
docs/adr/              Decisões arquiteturais
```

Não coloque componentes de demonstração dentro de `src/components`. Exemplos,
fixtures e dados fictícios devem permanecer em `src/demo`.

## Branches

Use nomes curtos e descritivos:

- `feat/astrocartography-map`;
- `fix/mobile-tooltip`;
- `docs/horary-example`;
- `test/astrology-glyphs`.

Evite misturar refatorações sem relação com a mudança principal.

## Regras para os domínios

- Use longitude eclíptica absoluta no intervalo de 0° a 360°.
- Reaproveite os tipos comuns de `src/core/astrology/types.ts`.
- Não recrie tipos de signos, casas, corpos, ângulos ou aspectos.
- Campos exclusivos da astrologia horária devem usar os tipos `Horary*`.
- Mudanças incompatíveis na API pública exigem ADR e nova versão principal.

## Componentes e estilos

- Preserve a responsividade dos SVGs.
- Não faça cálculos de efemérides dentro dos componentes.
- Mantenha navegação por teclado e textos acessíveis.
- Reutilize o catálogo interno de glifos astrológicos.
- Não adicione imagens ou assets proprietários.
- Teste toque, teclado, responsividade e redução de movimento.
- Prefira estilos `scoped` e evite dependências de CSS globais.

## Testes

- Testes de lógica e layouts devem ser determinísticos.
- Componentes interativos precisam testar eventos sem alterar props.
- Fixtures não podem conter dados pessoais reais.
- Mudanças visuais devem ser verificadas em desktop e em uma largura móvel.

## Pull requests

Descreva:

1. o problema resolvido;
2. a decisão tomada;
3. como a alteração foi validada;
4. impactos na API pública;
5. capturas de tela quando houver mudança visual.

Commits pequenos e focados tornam a revisão mais simples.

## Relato de problemas

Inclua a versão do pacote, a versão do Vue, o navegador, um exemplo mínimo dos
dados enviados ao componente e, quando possível, uma captura de tela.

## Licença

Ao contribuir, você concorda que sua contribuição será distribuída sob a
Licença MIT do projeto.
