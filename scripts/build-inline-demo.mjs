import { readdir, readFile, writeFile } from 'node:fs/promises'

const demoDirectory = new URL('../demo-dist/', import.meta.url)
const assetsDirectory = new URL('./assets/', demoDirectory)
const assetFiles = await readdir(assetsDirectory)
const jsFile = assetFiles.find((file) => file.endsWith('.js'))
const cssFile = assetFiles.find((file) => file.endsWith('.css'))

if (!jsFile || !cssFile) {
  throw new Error('Os assets da demo não foram encontrados.')
}

const javascript = await readFile(new URL(jsFile, assetsDirectory), 'utf8')
const css = await readFile(new URL(cssFile, assetsDirectory), 'utf8')
const safeJavascript = javascript.replaceAll('</script', '<\\/script')

const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>astro-charts-br — demos de oráculos</title>
    <style>${css}</style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module">${safeJavascript}</script>
  </body>
</html>
`

await writeFile(new URL('./inline.html', demoDirectory), html)
