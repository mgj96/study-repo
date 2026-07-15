<script setup>
import DefaultTheme from 'vitepress/theme'
import { ref, onMounted, onUnmounted } from 'vue'

const { Layout } = DefaultTheme
const progress = ref(0)

function update() {
  const el = document.documentElement
  const scrollable = el.scrollHeight - el.clientHeight
  progress.value = scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0
}

onMounted(() => {
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update, { passive: true })
  update()
})

onUnmounted(() => {
  window.removeEventListener('scroll', update)
  window.removeEventListener('resize', update)
})
</script>

<template>
  <Layout>
    <template #layout-top>
      <div
        class="reading-progress"
        :style="{ width: progress + '%' }"
        aria-hidden="true"
      />
    </template>
  </Layout>
</template>

<style>
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #D97757, #BD4B2B);
  box-shadow: 0 0 8px rgba(217, 119, 87, 0.5);
  z-index: 200;
  transition: width 0.1s linear;
  pointer-events: none;
}
</style>
