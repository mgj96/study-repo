<script setup>
import DefaultTheme from 'vitepress/theme'
import { useRoute, useRouter } from 'vitepress'
import { ref, onMounted, onUnmounted, watch } from 'vue'

const { Layout } = DefaultTheme
const route = useRoute()
const router = useRouter()

/* ── 읽기 진행바 ── */
const progress = ref(0)
function updateProgress() {
  const el = document.documentElement
  const scrollable = el.scrollHeight - el.clientHeight
  progress.value = scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0
}

/* ── 자동(스르륵) 스크롤 ── */
const autoScrolling = ref(false)
const speed = ref(45)
const TICK = 40
let timer = null
function tick() {
  const per = Math.max(1, Math.round((speed.value * TICK) / 1000))
  const el = document.documentElement
  const before = el.scrollTop
  window.scrollBy(0, per)
  if (el.scrollTop === before || el.scrollTop + el.clientHeight >= el.scrollHeight - 2) stopAuto()
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
  if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) stopAuto()
}
function toggleAuto() { autoScrolling.value ? stopAuto() : startAuto() }
function slower() { speed.value = Math.max(15, speed.value - 20) }
function faster() { speed.value = Math.min(160, speed.value + 20) }

/* ── 북마크 + 보던 위치 기억 (localStorage) ── */
const bookmarks = ref([])
const isBookmarked = ref(false)
const lastVisit = ref(null)
const showPanel = ref(false)
let scrollSaveTimer = 0

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch (e) { return d } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} }
function pageTitle() { return (document.title || '').replace(/\s*[|·]\s*개발 학습 노트\s*$/, '').trim() || route.path }

function refreshBookmarks() {
  bookmarks.value = lsGet('study:bookmarks', [])
  isBookmarked.value = bookmarks.value.some((b) => b.path === route.path)
}
function toggleBookmark() {
  let bm = lsGet('study:bookmarks', [])
  if (bm.some((b) => b.path === route.path)) bm = bm.filter((b) => b.path !== route.path)
  else bm.unshift({ path: route.path, title: pageTitle(), ts: Date.now() })
  lsSet('study:bookmarks', bm.slice(0, 50))
  refreshBookmarks()
}
function removeBookmark(path) {
  const bm = lsGet('study:bookmarks', []).filter((b) => b.path !== path)
  lsSet('study:bookmarks', bm)
  refreshBookmarks()
}
function go(path) { showPanel.value = false; router.go(path) }

function saveVisit() { lsSet('study:lastVisit', { path: route.path, title: pageTitle(), ts: Date.now() }) }
function saveScroll() {
  const m = lsGet('study:scrolls', {})
  m[route.path] = Math.round(window.scrollY)
  lsSet('study:scrolls', m)
}
function onScrollSave() {
  if (scrollSaveTimer) return
  scrollSaveTimer = window.setTimeout(() => { scrollSaveTimer = 0; saveScroll() }, 500)
}
function restoreScroll() {
  if (location.hash) return
  const y = (lsGet('study:scrolls', {}) || {})[route.path]
  if (y && y > 120) window.setTimeout(() => window.scrollTo({ top: y }), 80)
}

onMounted(() => {
  window.addEventListener('scroll', updateProgress, { passive: true })
  window.addEventListener('resize', updateProgress, { passive: true })
  window.addEventListener('scroll', onScrollSave, { passive: true })
  updateProgress()
  refreshBookmarks()
  lastVisit.value = lsGet('study:lastVisit', null)
  restoreScroll() // 새로고침/재방문 시 보던 위치 복원
  saveVisit()
})
onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress)
  window.removeEventListener('resize', updateProgress)
  window.removeEventListener('scroll', onScrollSave)
  stopAuto()
})
watch(() => route.path, () => {
  stopAuto()
  refreshBookmarks()
  lastVisit.value = lsGet('study:lastVisit', null)
  saveVisit()
})
</script>

<template>
  <Layout>
    <template #layout-top>
      <div class="reading-progress" :style="{ width: progress + '%' }" aria-hidden="true" />
    </template>
  </Layout>

  <!-- 읽기 도우미 (플로팅) -->
  <div class="read-tools">
    <!-- 북마크/이어보기 패널 -->
    <div v-if="showPanel" class="rt-panel">
      <div class="rt-panel-h">
        <span>📑 북마크 · 이어보기</span>
        <button class="rt-x" @click="showPanel = false" aria-label="닫기">✕</button>
      </div>
      <div v-if="lastVisit" class="rt-last">
        <span class="rt-cap">마지막 본 페이지</span>
        <a href="javascript:void(0)" @click="go(lastVisit.path)">↩ {{ lastVisit.title }}</a>
      </div>
      <div class="rt-cap" style="margin-top:8px;">북마크</div>
      <ul v-if="bookmarks.length" class="rt-bm">
        <li v-for="b in bookmarks" :key="b.path">
          <a href="javascript:void(0)" @click="go(b.path)">{{ b.title }}</a>
          <button class="rt-x" @click="removeBookmark(b.path)" aria-label="삭제">✕</button>
        </li>
      </ul>
      <p v-else class="rt-empty">아직 북마크가 없어요. 🔖 로 이 페이지를 저장하세요.</p>
    </div>

    <div class="rt-row" :class="{ active: autoScrolling }">
      <button class="rt-step" @click="slower" title="느리게" aria-label="느리게">−</button>
      <button class="rt-main" @click="toggleAuto" :aria-pressed="autoScrolling">
        <span v-if="autoScrolling">⏸ 멈춤</span><span v-else>▶ 자동 읽기</span>
      </button>
      <button class="rt-step" @click="faster" title="빠르게" aria-label="빠르게">+</button>
    </div>

    <div class="rt-bmrow">
      <button class="rt-pill" :class="{ 'teal-active': isBookmarked }" @click="toggleBookmark" :aria-pressed="isBookmarked">
        <span v-if="isBookmarked">🔖 북마크됨</span><span v-else>🔖 북마크</span>
      </button>
      <button class="rt-pill" @click="showPanel = !showPanel" :aria-expanded="showPanel">📑 목록</button>
    </div>
  </div>
</template>

<style>
.reading-progress {
  position: fixed; top: 0; left: 0; height: 3px;
  background: linear-gradient(90deg, #D97757, #BD4B2B);
  box-shadow: 0 0 8px rgba(217, 119, 87, 0.5);
  z-index: 200; transition: width 0.1s linear; pointer-events: none;
}
.read-tools {
  position: fixed; right: 20px; bottom: 20px; z-index: 60;
  display: flex; flex-direction: column; align-items: flex-end; gap: 8px;
  font-family: var(--vp-font-family-base);
}
.rt-row {
  display: flex; align-items: stretch; gap: 2px; padding: 4px; border-radius: 999px;
  background: var(--vp-c-bg-soft, #f6f6f7); border: 1px solid var(--vp-c-divider, #e2e2e3);
  box-shadow: 0 6px 20px -6px rgba(0, 0, 0, 0.3);
}
.rt-row.active { border-color: #D97757; box-shadow: 0 6px 22px -4px rgba(217, 119, 87, 0.55); }
.read-tools button { border: 0; background: transparent; color: var(--vp-c-text-1); cursor: pointer; border-radius: 999px; transition: background 0.15s ease; }
.rt-main { padding: 8px 14px; font-size: 0.85rem; font-weight: 700; white-space: nowrap; }
.rt-row.active .rt-main { background: #D97757; color: #fff; }
.rt-step { width: 34px; font-size: 1.15rem; font-weight: 700; line-height: 1; }
.rt-row button:hover { background: var(--vp-c-default-soft, rgba(142, 150, 170, 0.14)); }
.rt-row.active .rt-main:hover { background: #C25333; }

.rt-bmrow { display: flex; gap: 8px; }
.rt-pill {
  padding: 8px 14px; font-size: 0.82rem; font-weight: 700; white-space: nowrap;
  background: var(--vp-c-bg-soft, #f6f6f7); border: 1px solid var(--vp-c-divider, #e2e2e3) !important;
  box-shadow: 0 6px 20px -6px rgba(0, 0, 0, 0.3);
}
.rt-pill:hover { background: var(--vp-c-default-soft, rgba(142, 150, 170, 0.14)); }
.rt-pill.teal-active { background: #0E9E8E; color: #fff; border-color: #0E9E8E !important; box-shadow: 0 6px 22px -4px rgba(14, 158, 142, 0.5); }
.rt-pill.teal-active:hover { background: #0c8a7c; }

.rt-panel {
  width: 260px; max-width: 78vw; padding: 14px 16px; border-radius: 14px;
  background: var(--vp-c-bg, #fff); border: 1px solid var(--vp-c-divider, #e2e2e3);
  box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.35); font-size: 0.86rem;
}
.rt-panel-h { display: flex; justify-content: space-between; align-items: center; font-weight: 800; margin-bottom: 10px; }
.rt-cap { font-size: 0.72rem; font-weight: 700; color: var(--vp-c-text-2); text-transform: none; }
.rt-last a, .rt-bm a { color: var(--vp-c-brand-1); text-decoration: none; font-weight: 600; }
.rt-last a:hover, .rt-bm a:hover { text-decoration: underline; }
.rt-last { margin-bottom: 4px; }
.rt-bm { list-style: none; margin: 6px 0 0; padding: 0; max-height: 200px; overflow-y: auto; }
.rt-bm li { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 5px 0; border-top: 1px solid var(--vp-c-divider, #eee); }
.rt-bm li a { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rt-x { width: 24px; height: 24px; flex: none; font-size: 0.8rem; color: var(--vp-c-text-2); background: transparent; border: 0; cursor: pointer; border-radius: 6px; }
.rt-x:hover { background: var(--vp-c-default-soft, rgba(142,150,170,.14)); }
.rt-empty { color: var(--vp-c-text-2); margin: 6px 0 0; font-size: 0.82rem; }

@media (max-width: 640px) {
  .read-tools { right: 12px; bottom: 12px; gap: 6px; }
  .rt-main, .rt-pill { padding: 7px 11px; font-size: 0.78rem; }
}
</style>
