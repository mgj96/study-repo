# LLM 코딩 도구 — 검색 방식 · 컨텍스트량 · 용도별 선택

## 큰 그림: "어떻게 관련 코드를 찾아오나"

LLM은 학습 시점 이후의 *내 코드*를 모른다.
그래서 모든 코딩 도구의 핵심은 **"무엇을 context에 넣어줄지 고르는 방식"** 이다.
이 방식이 도구마다 완전히 다르고, 그게 곧 도구의 성격을 결정한다.

```
내 코드베이스  ──(검색/선별)──▶  context window  ──▶  LLM  ──▶  응답
                  ↑ 이 단계가 도구마다 다름
```

---

## 검색(컨텍스트 수집) 방식 4가지 유형

| 유형 | 방식 | 대표 도구 |
|------|------|-----------|
| **로컬 근접** | 지금 열린 파일 + 주변 파일을 자동 포함 | GitHub Copilot |
| **에이전트 탐색** | 스스로 grep/read/실행하며 필요한 파일을 찾아 읽음 | Claude Code, Codex CLI |
| **시맨틱 인덱싱(RAG)** | 코드베이스를 임베딩으로 색인 → 질문과 의미가 가까운 조각 검색 | Cursor, Continue |
| **통째 투입** | 큰 context에 코드 전체를 그냥 다 넣음 | Gemini (1M) |

---

## 도구별 상세

### GitHub Copilot — 로컬 근접
- **검색 방식**: 현재 편집 중인 파일 + 최근 연 파일 + 같은 폴더 일부를 자동으로 context에 넣음
- **컨텍스트량**: 작음 (수천 토큰 수준, 인라인 자동완성용)
- **못 하는 것**: 프로젝트 전체 구조 파악, 멀리 떨어진 파일 간 관계 추론
- **용도**: 함수 단위 자동완성, 보일러플레이트, 반복 패턴
```
"지금 타이핑 중인 곳" 주변만 본다 → 빠르지만 근시안적
```

### Claude Code — 에이전트 탐색 (grep 기반)
- **검색 방식**: **ripgrep(rg)** 으로 텍스트를 직접 훑는다. 임베딩·벡터DB·사전 인덱싱을 **안 쓴다.**
  `ls`/`grep`/`read`/`git log`를 **스스로 호출**하며 사람 개발자처럼 탐색.
- **+ LSP(언어 서버)**: v2.0.74(2025-12)부터 LSP 지원 추가 → `goToDefinition`,
  `findReferences` 같은 **심볼 단위 정밀 조회**. grep(넓게) + LSP(정밀)의 **2층 구조**.
- **왜 grep인가 (설계 철학)**: Anthropic은 로컬 벡터DB·재귀 인덱싱을 실험했지만
  **"평범한 glob/grep이 이겼다"**. 이유:
  - 사전 빌드 비용 0 (인덱싱 대기 없음, 즉시 사용)
  - 모든 파일 타입 커버, 높은 recall, 실패해도 무해(false positive뿐)
  - 에이전트는 셸로 동작 → 셸에서 바로 실행되고 텍스트를 뱉는 grep이 가장 native
  - `.gitignore`를 자동 존중 → `node_modules`·빌드산출물 자동 제외
- **컨텍스트량**: 200K (1M 베타). 필요한 파일만 골라 읽어 효율적으로 채움.
- **앞으로의 강점**: 인덱스가 없어 **항상 현재 코드의 진실**을 본다(stale 없음).
  코드베이스가 커져도 "필요한 곳만 grep"이라 확장성 좋음. 셸 기반이라 어떤 환경에도 이식.
```
질문 → rg로 후보 찾기 → 의심 파일 read → (필요시 LSP로 정의/참조 확인) → 수정
```
출처: [Why Claude Code Chose ripgrep](https://rust-trends.com/posts/ripgrep-claude-code/),
[Why agents still use grep](https://yage.ai/share/why-coding-agents-still-use-grep-en-20260327.html)

### Codex CLI (GPT-5.5) — 에이전트 탐색 (이것도 grep)
- **검색 방식**: **Claude Code와 동일하게 grep/rg 기반 에이전트 탐색.** ⚠️ **인덱스 기반 아님.**
- **현재 한계**: 일급(first-class) 시맨틱 검색이 없어, 중대형/다국어 레포에서
  "이름 바뀐 식별자"나 "개념이 다르게 표현된 코드"는 grep만으론 놓칠 수 있음.
- **인덱싱은 '제안' 단계**: `codex index`(OpenAI 임베딩으로 로컬 색인) / `codex search`는
  GitHub 이슈로 **제안된 미래 기능**일 뿐, 아직 코어 기능이 아니다.
- **컨텍스트량**: Codex 400K / API 1M.
출처: [Codex CLI Features](https://developers.openai.com/codex/cli/features),
[Issue #5181 semantic indexing](https://github.com/openai/codex/issues/5181)

### Cursor — 시맨틱 인덱싱(RAG) ★ "인덱스 기반"은 이 도구
- **검색 방식**: 진짜 **임베딩/벡터 검색**을 쓰는 대표 도구.
  1. 열린 폴더를 스캔해 **Merkle 트리(파일 해시)** 구성
  2. 파일을 로컬에서 **청크(chunk)** 로 쪼갬
  3. 청크를 서버로 보내 **임베딩 생성**(OpenAI 또는 자체 모델), 벡터DB(Turbopuffer)에 저장
  4. 질문이 오면 질문도 임베딩 → **최근접 이웃 검색**으로 의미가 가까운 청크 회수(RAG)
- **프라이버시**: 원본 코드는 로컬에 남고, **임베딩+메타데이터(파일경로·라인)만** 클라우드 저장.
- **강점**: "결제 로직 어디?"처럼 **위치/키워드를 몰라도 의미로** 찾음.
- **주의**: 색인이 오래되면(파일 변경 후 재색인 전) 엉뚱한 청크를 가져올 수 있음.
```
"의미가 비슷한 코드"를 벡터로 검색 → 키워드 몰라도 찾음
```
출처: [How Cursor Indexes Codebases](https://read.engineerscodex.com/p/how-cursor-indexes-codebases-fast),
[Secure codebase indexing](https://cursor.com/blog/secure-codebase-indexing)

### Gemini (3.1 Pro / 3 Flash) — 통째 투입
- **검색 방식**: 검색이랄 게 거의 없음. 1M context에 **코드를 통째로** 넣음
- **컨텍스트량**: 1M (약 75만 단어 / 중대형 레포 전체)
- **강점**: 대형 레거시 전체를 한 번에 보고 분석, 문서+코드 동시 투입(멀티모달)
- **주의**: 다 넣으면 비용/지연 ↑, "건초더미 속 바늘" 정확도 저하 가능
```
find . -name "*.ts" | xargs cat > all.txt → 그냥 다 넣어
```

### GitHub Copilot (보강)
- **검색 방식**: 현재 편집 파일 + 최근 연 파일 중심 (로컬 근접). IDE에 따라 일부 워크스페이스 검색 보강.
- **용도**: 인라인 자동완성. 깊은 코드베이스 탐색용은 아님.

---

## 검증 메모 — 흔한 오해

> **"Codex는 인덱스 기반, Claude Code는 grep"** ← 틀림.
> **Claude Code와 Codex CLI 둘 다 grep/ripgrep 에이전트 탐색**을 한다.
> 임베딩/벡터 인덱스를 핵심으로 쓰는 건 **Cursor**다.
> 업계는 오히려 grep으로 수렴 중 — "사전 인덱싱 비용 0 + 항상 최신 + 셸 native"가 강력.
> 정밀도가 필요한 부분만 **LSP**로 보강하는 2층 구조가 현재의 표준.

---

## 컨텍스트량 한눈에 (2026-05-31 기준 검증)

| 도구/모델 | Context | 들어가는 양(대략) | 함의 |
|-----------|---------|------------------|------|
| Copilot (인라인) | 수천 토큰 | 파일 몇 개 | 근처만 |
| Claude Opus 4.8 / Sonnet 4.6 | 200K (1M 베타) | ~15만 줄 | 대형 |
| GPT-5.5 (Codex) | 400K | ~30만 줄 | 대형~ |
| GPT-5.5 (API) | 1M | ~75만 줄 | 모노레포 |
| Gemini 3.1 Pro / 3 Flash | 1M | ~75만 줄 | 모노레포 |

> ⚠️ 버전·수치는 빠르게 낡는다. 최신은 공식 문서로 재확인.
>
> **핵심 오해 주의**: context가 크다고 무조건 좋은 게 아니다.
> 다 채우면 (1) 비용↑ (2) 응답 느려짐 (3) 중요한 부분이 묻혀 정확도 저하.
> → **"다 넣기"보다 "잘 골라 넣기"** 가 거의 항상 낫다 (RAG/에이전트가 이 일을 함).

---

## 용도별 선택 가이드

```
빠른 자동완성 / 반복 코드
   └▶ GitHub Copilot

위치 모르는 코드 찾기 ("결제 어디?")
   └▶ Cursor (시맨틱 검색)

멀티파일 리팩토링 / 구조 분석 / 버그 추적
   └▶ Claude Code (에이전트 탐색)

대형 레거시 전체를 한 번에 파악
   └▶ Gemini 1M (통째 투입)

일반 질문 / 알고리즘 설명
   └▶ ChatGPT / Claude

비용 0, 로컬/오프라인
   └▶ Llama·Qwen (Ollama)
```

### 판단 순서 (의사결정 흐름)

```
1. 코드 위치를 아는가?
   YES → 해당 파일 직접 제공 (어느 도구든 OK)
   NO  → 시맨틱 검색(Cursor) 또는 에이전트 탐색(Claude Code)

2. 작업이 여러 파일에 걸치나?
   YES → 에이전트형 (Claude Code / Codex CLI)
   NO  → 인라인(Copilot)으로 충분

3. 코드베이스가 200K 토큰을 넘나?
   YES → 통째 투입(Gemini) 또는 계층적 요약
   NO  → 일반 도구로 충분

4. 민감/사내 코드라 외부 전송 불가?
   YES → 로컬 모델(Ollama)
```

---

## 관련 문서

- [모델별 비교](model-comparison.md) — 모델 자체의 강점/약점/비용
- [LLM이란 무엇인가](what-is-llm.md) — context window, 토큰 개념
- [코드베이스 분석 방법](codebase-analysis.md) — 컨텍스트 전달 실전
