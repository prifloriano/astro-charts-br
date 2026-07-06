<template>
  <main class="demo-page">
    <AstrocartographyMap
      :chart="astrocartographySample"
      @line-select="selectedLine = $event.line.planetName + ' · ' + $event.line.angle"
    />
    <p v-if="selectedLine" class="demo-selection">Linha selecionada: {{ selectedLine }}</p>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AstrocartographyMap } from './index'
import { astrocartographySample } from './demo/astrocartographySample'

const selectedLine = ref('')
</script>

<style scoped>
.demo-page {
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 34px 18px;
  background:
    radial-gradient(circle at 16% 4%, rgb(122 73 166 / 28%) 0, transparent 29%),
    radial-gradient(circle at 85% 10%, rgb(37 107 156 / 22%) 0, transparent 27%),
    linear-gradient(180deg, #090615 0%, #160d26 53%, #080e1d 100%);
}

.demo-selection {
  margin: 0;
  color: #cbb9d7;
  font-size: 0.75rem;
}
</style>
