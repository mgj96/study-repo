# Claude 신모델 vs OpenAI GPT-5.6 비교 정리 (2026.07)

> 공부용 정리 노트. 출처는 문서 하단에 정리.
> 벤치마크 수치는 대부분 벤더(제조사) 발표 기준이며, 독립 검증되지 않은 값이 섞여 있으므로 참고용으로만 볼 것.

---

## 1. 한눈에 보는 타임라인 (2026)

| 날짜 | 모델 | 비고 |
|------|------|------|
| 5/28 | Claude **Opus 4.8** | 정확성 중심 최상위 |
| 6/9 | Claude **Fable 5**, **Mythos 5** | Opus 위 새 티어 "Mythos class" |
| 6/30 | Claude **Sonnet 5** | 가성비/에이전트 |
| 7/9 | OpenAI **GPT-5.6** (Luna / Terra / Sol) | 신규 3종 패밀리 |

---

## 2. 모델 라인업

### Claude (Anthropic)
| 모델 | 포지션 | 특징 |
|------|--------|------|
| Sonnet 5 | 가성비·고volume | "가장 에이전트다운 Sonnet", 브라우저·터미널 자율 실행 |
| Opus 4.8 | 정확성·대규모 | Dynamic Workflows(수백 개 서브에이전트 병렬 + 테스트 검증) |
| Fable 5 | 프리미엄·장기 에이전트 | Mythos급, 지속 메모리·적응형 사고·자동 대화 압축 |

### GPT-5.6 (OpenAI) — 이름은 천체(달·땅·태양) 순서로 강함
| 모델 | 포지션 | 특징 |
|------|--------|------|
| Luna | 최속·최저가 | 속도/예산 우선 |
| Terra | 밸런스 | GPT-5.5급 성능을 절반 비용으로 |
| Sol | 최상위 | 코딩·지식노동·보안·과학 SOTA, 토큰 효율 강조 |

---

## 3. 가격 비교 (100만 토큰당, USD)

| 모델 | Input | Output |
|------|-------|--------|
| GPT-5.6 Luna | $1 | $6 |
| GPT-5.6 Terra | $2.5 | $15 |
| GPT-5.6 Sol | $5 | $30 |
| Claude Sonnet 5 | $2 (~8/31까지 인트로, 이후 $3) | $10 (이후 $15) |
| Claude Opus 4.8 | $5 | $25 |
| Claude Fable 5 | $10 | $50 |

- **최상위 대결(Sol vs Fable 5)**: 입력은 Sol이 절반($5 vs $10), 출력은 Sol이 $30 vs Fable $50로 더 저렴.
- Fable 5 = Opus 4.8 가격의 정확히 2배.

---

## 4. 벤치마크 비교

| 벤치마크 | GPT-5.6 Sol | Claude Fable 5 | Claude Opus 4.8 | Claude Sonnet 5 |
|----------|-------------|----------------|-----------------|-----------------|
| SWE-bench Pro | 64.6% | **80.3%** | 69.2% | 63.2% |
| Artificial Analysis Coding Agent Index | **80** (Fable보다 +2.8) | 77.2 | – | – |
| Terminal-Bench 2.1 | 88.8% (Sol Ultra 91.9%) | – | – | – |
| DeepSWE | 72.7% | – | – | – |

> **핵심 관전 포인트**: 지표에 따라 승자가 갈림.
> - OpenAI 발표(Coding Agent Index)에서는 **Sol > Fable 5** (80 vs 77.2)
> - Anthropic 계열 SWE-bench Pro에서는 **Fable 5 > Sol** (80.3% vs 64.6%)
> → 서로 자기에게 유리한 벤치마크를 내세우는 구도.

---

## 5. GPT-5.6의 개선사항 (vs GPT-5.5)

- **토큰 효율**: Sam Altman이 코딩 작업 기준 "GPT-5.5 대비 54% 더 토큰 효율적"이라 언급.
  - PR 벤치마크에서 PR당 약 **3배 적은 토큰**, 중앙값 지연 약 **2배 감소**.
  - (단, Intelligence Index 태스크 기준으로는 15k vs 16k 토큰으로 개선폭이 완만 — 지표별 편차 큼)
- **컨텍스트 윈도우**: Sol 기준 **약 1.05M**, 최대 출력 128K.
- **비용 구조**: Terra가 GPT-5.5급 성능을 절반 가격으로 제공 → 실사용 비용 하락.

## 6. Claude Fable 5의 개선사항 (신규 Mythos 티어)

- **지속 메모리(persistent memory)**: 세션 간 컨텍스트 유지.
- **적응형 사고(adaptive thinking)**: 난이도에 따라 추론 깊이 조절.
- **자동 대화 압축(auto compaction)**: 긴 작업에서 컨텍스트 자동 관리 → 장기 에이전트 작업에 최적.
- **실시간 안전 분류기** 탑재.

---

## 7. 어떤 상황에 무엇을 쓸까

| 상황 | 추천 |
|------|------|
| 고volume·일상 코딩·자동화 | Sonnet 5 / GPT-5.6 Terra·Luna |
| 정확성 필수 대규모 리팩터(10만 라인+) | Opus 4.8 |
| 며칠 단위 장기 계획·에이전트 | Fable 5 |
| 코딩 벤치 최상위·토큰 절감 | GPT-5.6 Sol |

> 참고: 비용의 더 큰 레버는 "모델 선택"보다 **effort level**.
> max effort는 low 대비 대화 턴을 약 6배 소모.

---

## 출처
- OpenAI, "GPT-5.6: Frontier intelligence" — https://openai.com/index/gpt-5-6/
- OpenAI, "Previewing GPT-5.6 Sol" — https://openai.com/index/previewing-gpt-5-6-sol/
- TechCrunch (2026.07.09) — https://techcrunch.com/2026/07/09/openai-launches-its-new-family-of-models-with-gpt-5-6/
- Artificial Analysis, "GPT-5.6 has landed" — https://artificialanalysis.ai/articles/gpt-5-6-has-landed
- Simon Willison, "The new GPT-5.6 family" — https://simonwillison.net/2026/Jul/9/gpt-5-6/
- Anthropic, "Introducing Claude Sonnet 5" — https://www.anthropic.com/news/claude-sonnet-5
- Claude Platform Docs, "Introducing Fable 5 and Mythos 5" — https://platform.claude.com/docs/en/about-claude/models/introducing-claude-fable-5-and-claude-mythos-5
- DigitalApplied, "Sonnet 5 vs Opus 4.8 vs Fable 5" — https://www.digitalapplied.com/blog/claude-sonnet-5-opus-4-8-fable-5-when-to-use-which-2026
- Claude Timeline — https://www.scriptbyai.com/anthropic-claude-timeline/

_작성일: 2026-07-14 · 벤치마크 수치는 벤더 발표 기준, 독립 검증 전 참고용_
