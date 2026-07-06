# Publicação no GitHub e npm

Este guia prepara o `astro-charts-br` para virar um pacote público consumível em
apps Vue via npm.

## 1. Antes do primeiro push

Confira os metadados principais em `package.json`:

- `name`: nome do pacote no npm;
- `version`: versão atual;
- `description`: resumo curto que aparece no npm;
- `license`: licença do pacote;
- `author`: mantenedora;
- `exports`: arquivos que o app consumidor consegue importar;
- `files`: arquivos incluídos no pacote publicado;
- `peerDependencies`: dependências que o app consumidor deve instalar.

Se o repositório ainda não existir no GitHub:

```bash
git init
git branch -M main
git add .
git commit -m "chore: initial public package"
```

Crie o repositório vazio no GitHub e depois conecte:

```bash
git remote add origin https://github.com/prifloriano/astro-charts-br.git
git push -u origin main
```

Depois que a URL real existir, é recomendável adicionar ao `package.json`:

```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/prifloriano/astro-charts-br.git"
  },
  "bugs": {
    "url": "https://github.com/prifloriano/astro-charts-br/issues"
  },
  "homepage": "https://github.com/prifloriano/astro-charts-br#readme"
}
```

## 2. Checklist antes de publicar

Execute tudo localmente antes de criar uma tag ou publicar no npm:

```bash
npm install
npm run format:check
npm run check
npm pack --dry-run
```

Se o npm reclamar de permissão na cache global, rode o dry-run com uma cache
temporária:

```bash
npm pack --dry-run --cache /private/tmp/astro-charts-br-npm-cache
```

Isso não altera o pacote; apenas evita usar `~/.npm` naquele comando. Para uma
correção permanente, ajuste a posse da pasta `~/.npm` no seu ambiente.

O `npm pack --dry-run` mostra exatamente o que entrará no pacote. Confira se
aparecem apenas arquivos esperados, como:

- `dist/index.js`;
- `dist/style.css`;
- `dist/types/**`;
- `README.md`;
- `LICENSE`;
- `CHANGELOG.md`;
- `CONTRIBUTING.md`;
- `ADR.md`;
- `docs/**`;
- `THIRD_PARTY_NOTICES.md`.

Não devem entrar:

- `node_modules`;
- `src/demo` sem necessidade;
- `demo-dist`;
- `coverage`;
- arquivos locais do editor;
- dados pessoais reais.

## 3. Versionamento

O projeto segue versionamento semântico:

- `patch`: correção compatível, ex. `0.1.0` → `0.1.1`;
- `minor`: componente novo ou API compatível, ex. `0.1.0` → `0.2.0`;
- `major`: mudança incompatível, ex. `1.0.0` → `2.0.0`.

Enquanto o pacote estiver em `0.x`, trate mudanças de API com cuidado e
documente no `CHANGELOG.md`.

Comandos úteis:

```bash
npm version patch
npm version minor
npm version major
```

Cada comando atualiza `package.json`, `package-lock.json` e cria um commit/tag
quando o projeto estiver em um repositório git.

## 4. Publicação no npm

Faça login:

```bash
npm login
```

Publique:

```bash
npm publish --access public
```

O script `prepublishOnly` roda `npm run build` antes da publicação. Se o build
falhar, o pacote não será publicado.

Para conferir depois:

```bash
npm view astro-charts-br
npm view astro-charts-br version
```

## 5. Teste em um app consumidor

Em outro projeto Vue:

```bash
npm install astro-charts-br vue
```

No `main.ts`:

```ts
import { createApp } from 'vue'
import App from './App.vue'
import 'astro-charts-br/style.css'

createApp(App).mount('#app')
```

Em um componente:

```vue
<template>
  <NatalChartWheel :chart="chart" />
</template>

<script setup lang="ts">
import { NatalChartWheel } from 'astro-charts-br'
import type { NatalChartData } from 'astro-charts-br'

const chart: NatalChartData = {
  angles: { ascendant: 0, midheaven: 90 },
  houses: [
    { house: 1, longitude: 0 },
    { house: 2, longitude: 30 },
    { house: 3, longitude: 60 },
    { house: 4, longitude: 90 },
    { house: 5, longitude: 120 },
    { house: 6, longitude: 150 },
    { house: 7, longitude: 180 },
    { house: 8, longitude: 210 },
    { house: 9, longitude: 240 },
    { house: 10, longitude: 270 },
    { house: 11, longitude: 300 },
    { house: 12, longitude: 330 }
  ],
  bodies: [{ id: 'sun', name: 'Sol', longitude: 10, kind: 'planet' }]
}
</script>
```

Se o CSS não aparecer, confirme se `astro-charts-br/style.css` foi importado uma
vez no app.

## 6. GitHub Actions

O workflow `.github/workflows/ci.yml` roda:

- `npm ci`;
- `npm run format:check`;
- `npm run lint`;
- `npm run typecheck`;
- `npm run test`;
- `npm run build`;
- `npm pack --dry-run`.

Isso garante que pull requests e pushes na `main` continuem publicáveis.

## 7. Quando criar ADR

Crie um novo ADR em `docs/adr` quando a decisão:

- mudar a API pública;
- adicionar dependência de runtime;
- alterar os tipos compartilhados de astrologia;
- mudar a estratégia de publicação;
- afetar todos os componentes.

Atualize também `ADR.md` e `docs/adr/README.md`.
