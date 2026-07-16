<script setup>
import DefaultTheme from 'vitepress/theme'
import { useRoute } from 'vitepress'
import { ref, onMounted, onUnmounted, watch } from 'vue'

const { Layout } = DefaultTheme
const route = useRoute()

/* ── 읽기 진행바 ── */
const progress = ref(0)
function updateProgress() {
  const el = document.documentElement
  const scrollable = el.scrollHeight - el.clientHeight
  progress.value = scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0
}

/* ── 자동(스르륵) 스크롤 ── */
const autoScrolling = ref(false)
const speed = ref(45) // px/초 (천천히)
const TICK = 40 // ms (25Hz)
let timer = null

function tick() {
  const per = Math.max(1, Math.round((speed.value * TICK) / 1000))
  const el = document.documentElement
  const before = el.scrollTop
  window.scrollBy(0, per)
  // 더 못 내려가면(맨 아래) 정지
  if (el.scrollTop === before || el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
    stopAuto()
  }
}
function startAuto() {
  if (autoScrolling.value) return
  autoScrolling.value = true
  timer = setInterval(tick, TICK)
  window.addEventListener('wheel', stopAuto, { passive: true })
  window.addEventListener('touchstart', stopAuto, { passive: true })
  window.addEventListener('keydown', onKey, { passive: true })
}
function stopAuto() {
  if (!autoScrolling.value) return
  autoScrolling.value = false
  if (timer) clearInterval(timer)
  timer = null
  window.removeEventListener('wheel', stopAuto)
  window.removeEventListener('touchstart', stopAuto)
  window.removeEventListener('keydown', onKey)
}
function onKey(e) {
  // 방향키/스페이스/PageUp/Down 등 사용자가 직접 스크롤하려 하면 멈춤
  const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']
  if (keys.includes(e.key)) stopAuto()
}
function toggleAuto() {
  autoScrolling.value ? stopAuto() : startAuto()
}
function slower() { speed.value = Math.max(15, speed.value - 20) }
function faster() { speed.value = Math.min(160, speed.value + 20) }

onMounted(() => {
  window.addEventListener('scroll', updateProgress, { passive: true })
  window.addEventListener('resize', updateProgress, { passive: true })
  updateProgress()
})
onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress)
  window.removeEventListener('resize', updateProgress)
  stopAuto()
})
// 페이지(라우트) 바뀌면 자동 스크롤 정지
watch(() => route.path, () => stopAuto())
</script>

<template>
  <Layout>
    <template #layout-top>
      <div class="reading-progress" :style="{ width: progress + '%' }" aria-hidden="true" />
    </template>
  </Layout>

  <!-- 자동 스크롤 컨트롤 (플로팅) -->
  <div class="autoscroll-ctl" :class="{ active: autoScrolling }">
    <button class="as-step" @click="slower" title="느리게" aria-label="느리게">−</button>
    <button class="as-main" @click="toggleAuto" :aria-pressed="autoScrolling">
      <span v-if="autoScrolling">⏸ 멈춤</span>
      <span v-else>▶ 자동 읽기</span>
    </button>
    <button class="as-step" @click="faster" title="빠르게" aria-label="빠르게">+</button>
  </div>
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

/* 자동 스크롤 플로팅 컨트롤 */
.autoscroll-ctl {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 60;
  display: flex;
  align-items: stretch;
  gap: 2px;
  padding: 4px;
  border-radius: 999px;
  background: var(--vp-c-bg-soft, #f6f6f7);
  border: 1px solid var(--vp-c-divider, #e2e2e3);
  box-shadow: 0 6px 20px -6px rgba(0, 0, 0, 0.3);
  font-family: var(--vp-font-family-base);
}
.autoscroll-ctl.active {
  border-color: #D97757;
  box-shadow: 0 6px 22px -4px rgba(217, 119, 87, 0.55);
}
.autoscroll-ctl button {
  border: 0;
  background: transparent;
  color: var(--vp-c-text-1);
  cursor: pointer;
  border-radius: 999px;
  transition: background 0.15s ease;
}
.autoscroll-ctl .as-main {
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
}
.autoscroll-ctl.active .as-main {
  background: #D97757;
  color: #fff;
}
.autoscroll-ctl .as-step {
  width: 34px;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1;
}
.autoscroll-ctl button:hover {
  background: var(--vp-c-default-soft, rgba(142, 150, 170, 0.14));
}
.autoscroll-ctl.active .as-main:hover {
  background: #C25333;
}
@media (max-width: 640px) {
  .autoscroll-ctl { right: 12px; bottom: 12px; }
  .autoscroll-ctl .as-main { padding: 7px 11px; font-size: 0.8rem; }
}
</style>
