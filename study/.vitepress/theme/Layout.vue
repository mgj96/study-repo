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
const speed = ref(45) // px/초
const TICK = 40
let timer = null

function tick() {
  const per = Math.max(1, Math.round((speed.value * TICK) / 1000))
  const el = document.documentElement
  const before = el.scrollTop
  window.scrollBy(0, per)
  if (el.scrollTop === before || el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
    stopAuto()
  }
}
function startAuto() {
  if (autoScrolling.value) return
  stopSpeak() // 소리 읽기와 동시 실행 방지
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
  const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']
  if (keys.includes(e.key)) stopAuto()
}
function toggleAuto() {
  autoScrolling.value ? stopAuto() : startAuto()
}
function slower() { speed.value = Math.max(15, speed.value - 20) }
function faster() { speed.value = Math.min(160, speed.value + 20) }

/* ── 소리로 읽기 (TTS) ── */
const speaking = ref(false)
const ttsSupported = ref(true)
const rate = ref(1)
let queueEls = []

function collectReadable() {
  const doc = document.querySelector('.vp-doc')
  if (!doc) return []
  return [...doc.querySelectorAll('h1, h2, h3, h4, p, li')].filter((el) => {
    if (el.closest('pre, .mermaid, [class*="language-"], mjx-container')) return false
    return el.innerText.trim().length > 0
  })
}
function speakFrom(i) {
  if (!speaking.value) return
  if (i >= queueEls.length) { stopSpeak(); return }
  const el = queueEls[i]
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  const u = new SpeechSynthesisUtterance(el.innerText.trim())
  u.lang = 'ko-KR'
  u.rate = rate.value
  u.onend = () => { if (speaking.value) speakFrom(i + 1) }
  u.onerror = () => { if (speaking.value) speakFrom(i + 1) }
  window.speechSynthesis.speak(u)
}
function startSpeak() {
  if (!('speechSynthesis' in window)) { ttsSupported.value = false; return }
  stopAuto()
  queueEls = collectReadable()
  if (!queueEls.length) return
  speaking.value = true
  window.speechSynthesis.cancel()
  speakFrom(0)
}
function stopSpeak() {
  if (!speaking.value) return
  speaking.value = false
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}
function toggleSpeak() {
  speaking.value ? stopSpeak() : startSpeak()
}

onMounted(() => {
  window.addEventListener('scroll', updateProgress, { passive: true })
  window.addEventListener('resize', updateProgress, { passive: true })
  updateProgress()
  ttsSupported.value = typeof window !== 'undefined' && 'speechSynthesis' in window
})
onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress)
  window.removeEventListener('resize', updateProgress)
  stopAuto()
  stopSpeak()
})
watch(() => route.path, () => { stopAuto(); stopSpeak() })
</script>

<template>
  <Layout>
    <template #layout-top>
      <div class="reading-progress" :style="{ width: progress + '%' }" aria-hidden="true" />
    </template>
  </Layout>

  <!-- 읽기 도우미 (플로팅) -->
  <div class="read-tools">
    <div class="rt-row" :class="{ active: autoScrolling }">
      <button class="rt-step" @click="slower" title="느리게" aria-label="느리게">−</button>
      <button class="rt-main" @click="toggleAuto" :aria-pressed="autoScrolling">
        <span v-if="autoScrolling">⏸ 멈춤</span>
        <span v-else>▶ 자동 읽기</span>
      </button>
      <button class="rt-step" @click="faster" title="빠르게" aria-label="빠르게">+</button>
    </div>
    <button
      v-if="ttsSupported"
      class="rt-tts"
      :class="{ active: speaking }"
      @click="toggleSpeak"
      :aria-pressed="speaking"
    >
      <span v-if="speaking">⏹ 소리 멈춤</span>
      <span v-else>🔊 소리로 읽기</span>
    </button>
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

.read-tools {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  font-family: var(--vp-font-family-base);
}
.rt-row {
  display: flex;
  align-items: stretch;
  gap: 2px;
  padding: 4px;
  border-radius: 999px;
  background: var(--vp-c-bg-soft, #f6f6f7);
  border: 1px solid var(--vp-c-divider, #e2e2e3);
  box-shadow: 0 6px 20px -6px rgba(0, 0, 0, 0.3);
}
.rt-row.active {
  border-color: #D97757;
  box-shadow: 0 6px 22px -4px rgba(217, 119, 87, 0.55);
}
.read-tools button {
  border: 0;
  background: transparent;
  color: var(--vp-c-text-1);
  cursor: pointer;
  border-radius: 999px;
  transition: background 0.15s ease;
}
.rt-main { padding: 8px 14px; font-size: 0.85rem; font-weight: 700; white-space: nowrap; }
.rt-row.active .rt-main { background: #D97757; color: #fff; }
.rt-step { width: 34px; font-size: 1.15rem; font-weight: 700; line-height: 1; }
.rt-row button:hover { background: var(--vp-c-default-soft, rgba(142, 150, 170, 0.14)); }
.rt-row.active .rt-main:hover { background: #C25333; }

.rt-tts {
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
  background: var(--vp-c-bg-soft, #f6f6f7);
  border: 1px solid var(--vp-c-divider, #e2e2e3);
  box-shadow: 0 6px 20px -6px rgba(0, 0, 0, 0.3);
}
.rt-tts.active {
  background: #0E9E8E;
  color: #fff;
  border-color: #0E9E8E;
  box-shadow: 0 6px 22px -4px rgba(14, 158, 142, 0.55);
}
.rt-tts:hover { background: var(--vp-c-default-soft, rgba(142, 150, 170, 0.14)); }
.rt-tts.active:hover { background: #0c8a7c; }

@media (max-width: 640px) {
  .read-tools { right: 12px; bottom: 12px; gap: 6px; }
  .rt-main, .rt-tts { padding: 7px 11px; font-size: 0.8rem; }
}
</style>
