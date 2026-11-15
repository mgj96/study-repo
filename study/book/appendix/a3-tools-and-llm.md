# 부록 A 언어와 도구 · A.3 개발 도구와 LLM

> 부록

## 들어가며

IDE를 벗어난 검증 흐름과 AI 에이전트 도구 전략, LLM 코딩 도구가 관련 코드를 찾아오는 방식과 컨텍스트 양, 코드베이스 분석법, 그리고 모델 비교를 모았다. 모델 비교는 작성 시점 기준이라 숫자는 바뀔 수 있다.

---

## 개발 도구 전략 — IDE 탈출 검증과 AI 에이전트 도구 3종 (2026-08)

> 출발 질문 셋: ① IntelliJ에서 VS Code로 탈출 가능한가, 뭘 잃나? ② Orca·Buzz는 뭐고 Claude Code와 뭐가 다른가? ③ 제미나이 무료 모델로도 멀티에이전트가 되나?
> 결론 먼저: **IDE는 듀얼 운용, 에이전트는 단일이면 이전 불필요, 제미나이 무료 실험은 개인 코드 한정.**

> 📌 **결정 기록 (2026-08-31): Orca·Buzz·Gemini CLI 설치·도입하지 않음.**
> 이유 — 에이전트를 **Claude 하나만** 쓰므로 Orca의 핵심 가치(멀티 에이전트 경쟁·비교)가 성립하지 않고, 병렬 세션·워크트리는 Claude Code가 이미 내장. Buzz는 팀 도입 전제라 솔로에겐 무용.
> 재검토 트리거 — ① 두 번째 에이전트 구독이 생기면 → Orca ② 팀이 에이전트를 도입하면 → Buzz. 그 전까지 이 노트는 **참고 자료로만** 유지.
> 관련: [콘웨이 법칙과 AI 에이전트](../part3/ch12-conway-and-ai-agents.md) · [Kotlin 노트](a2-other-languages.md) · [품질 게이트](../part5/ch17-1-testing-and-standards.md)

---

### 1. IntelliJ → VS Code 탈출 검증

#### 라이선스 진실 (탈출 동기 재점검)

| | 가격 | Spring | JSP |
|---|---|---|---|
| IntelliJ **Community** | 이미 **무료·오픈소스** | ❌ Ultimate 전용 | ❌ Ultimate 전용 |
| IntelliJ Ultimate | 유료 | ✅ 최강 | ✅ |
| **VS Code** + Java 확장팩 | 무료 | ✅ (얕지만 무료) | ❌ **사실상 미지원** |

> 진짜 비교는 "무료 Community(스프링 없음) vs 무료 VS Code(스프링 있음)" — 무료 진영에선 VS Code 승.

#### 넘어가면 잃는 것

| 항목 | 손실 | 비고 |
|---|---|---|
| 리팩토링 | ★★★ | IntelliJ 50+ 자동 리팩토링 vs VS Code는 rename·extract 수준 |
| **JSP** | ★★★ | **레거시 JSP 유지보수하는 한 결정타** — 문법 하이라이트 수준뿐 |
| Spring 통합 깊이 | ★★☆ | bean 네비게이션·엔드포인트 뷰의 깊이 차이 |
| MyBatis 생태 | ★★☆ | MyBatisX류 매퍼 점프 플러그인이 IntelliJ에 몰림 |
| **단축키** | ★☆☆ | **IntelliJ IDEA Keybindings 확장이 590+ 키 이식** — 단, 리팩토링 계열은 **기능 자체가 없어서** 키만 살려도 무의미 |

얻는 것: 무료·경량·AI 확장 생태·**Vue/TS 프론트는 오히려 우세**.

> **판정: 듀얼 운용.** 사이드 프로젝트(코테·Kotlin 학습)는 VS Code, 회사 레거시(JSP·대규모 리팩토링)는 IntelliJ. "완전 탈출"은 JSP를 버리는 날 성립한다.

---

### 2. AI 에이전트 도구 3종 — 전부 다른 카테고리다

"IntelliJ에서 Orca로 이전"은 성립하지 않는 문장이다 — 셋은 층이 다르다:

| | **Claude Code 데스크탑** | **Orca** ([onorca.dev](https://www.onorca.dev/)) | **Buzz** ([buzz.xyz](https://block.xyz/inside/introducing-buzz-where-humans-and-agents-work-together)) |
|---|---|---|---|
| 카테고리 | 에이전트 **작업 실행기** | 병렬 실행 **관제탑** (ADE) | 인간+에이전트 **팀 채팅** |
| 핵심 가치 | Claude 하나를 깊게 (세션·도구·서브에이전트) | 여러 CLI 에이전트를 워크트리 격리로 **동시 실행 → 결과 비교 → 승자 선택** | 에이전트가 채널의 **동료**로 상주 — 암호학적 자기 신원(Nostr) |
| 가격 | Claude 구독 | **무료·MIT** (에이전트 구독 BYO) | **무료·오픈소스** (Block/잭 도시) |
| 관계 | — | Claude Code를 **안에서** 돌림 (포장지) | Claude Code가 **참여자로** 입장 (회의실) |

#### 이전 판단 — "에이전트 1개면 안 가는 게 맞다"

Orca의 존재 이유는 ① 여러 종류 에이전트 경쟁 ② 같은 작업 N번 병렬 시도. **Claude 하나만 쓰면 ①이 통째로 사라지고**, ②(병렬 세션·워크트리 격리·서브에이전트 팬아웃·백그라운드 작업)는 **Claude Code 데스크탑이 이미 내장**한다. 단일 에이전트 사용자에게 Orca는 이미 가진 기능의 다른 껍데기다.

**이전 트리거 2개**: ① 두 번째 에이전트(Codex·Gemini)를 붙여 경쟁시키고 싶을 때 → Orca ② 팀이 에이전트를 도입해 채널에 상주시킬 때 → Buzz.

---

### 3. 제미나이 무료로 멀티에이전트 실험이 되나?

**된다 — 단 조건부다.** Gemini CLI + 개인 구글 계정:

| 항목 | 내용 |
|---|---|
| 무료 한도 | **60회/분 · 1,000회/일** — 실험엔 충분 |
| 모델 | **2026-04부터 Pro급은 무료 제외** → 무료는 Flash급. Claude와 경쟁 시 체급 차 감안 |
| 비용 구조 | Orca(무료) + Claude(기존 구독) + Gemini CLI(무료) = **추가 0원으로 2-에이전트 경쟁 가능** |

> ⚠️ **결정적 경고 — 무료 티어는 코드를 학습에 쓴다.** 구글 약관이 무료 티어 입력을 제품 개선·ML 학습에 사용하고 리뷰어가 열람할 수 있다고 명시한다(민감·기밀 데이터 제출 금지 조항). **회사 코드(B2G·운영 소스)는 절대 무료 제미나이에 넣지 말 것** — 학습 미사용 보장은 유료 티어부터다.
>
> 실전 규칙: **개인 사이드 프로젝트·코테 연습 = 무료 실험 OK / 회사 코드 = Claude 단독 유지.** [품질 게이트 노트](../part5/ch17-1-testing-and-standards.md)의 비밀키 스캔과 같은 계열의 규율이다 — 코드가 어디로 흘러가는지가 곧 보안 경계다.

---

### 4. 콘웨이 노트와의 접점

이 3종은 [콘웨이×AI 노트](../part3/ch12-conway-and-ai-agents.md)의 논문 단계들이 반년 만에 제품이 된 구도다: **Orca** = 토폴로지를 UI로 갈아끼우는 역콘웨이 기동의 제품화, **Buzz** = "하이브리드 팀의 소통 경로에 에이전트가 정식 입주"(신원까지 부여), **Claude Code** = 그 안의 개별 노동자. 이론 노트가 예측한 카테고리가 실제로 열리는 중이다.

---

### 3단 요약 (암기)

- **① 결론 · WHAT** — IDE는 **듀얼 운용**(개인 작업 VS Code / 회사 레거시 IntelliJ — JSP가 결정타), 에이전트 도구는 **단일 에이전트면 Claude Code 유지**(Orca는 멀티 경쟁용, Buzz는 팀 채팅용 — 카테고리가 다름), 제미나이 무료는 **개인 코드 한정 실험용**.
- **② 원리 · HOW** — 도구 선택은 기능 목록이 아니라 **"내 병목이 뭔가"**로 정한다: 병목이 리팩토링·JSP면 IntelliJ가 남고, 병목이 에이전트 경쟁이 아니면 관제탑은 불필요하며, 무료 티어의 대가는 돈이 아니라 **데이터**(학습 사용)다.
- **③ 확장 · TRADE-OFF** — 세 판단 모두 시한부다: JSP를 걷어내면 IDE 판정이 뒤집히고, 두 번째 에이전트 구독이 생기면 Orca가 유효해지고, 팀이 에이전트를 도입하면 Buzz가 회의실이 된다. **도구 전략은 결정이 아니라 트리거 목록**으로 관리하라 — 이 노트의 트리거들이 그것이다.

---

### 🔗 링크 모음

| 분류 | 링크 |
|---|---|
| VS Code Java | [Extension Pack for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack) · [Spring Boot Extension Pack](https://marketplace.visualstudio.com/items?itemName=vmware.vscode-boot-dev-pack) · [IntelliJ IDEA Keybindings](https://marketplace.visualstudio.com/items?itemName=k--kato.intellij-idea-keybindings) |
| Orca | [공식](https://www.onorca.dev/) · [리뷰](https://vibecodinghub.org/tools/orca) |
| Buzz | [소개(Block)](https://block.xyz/inside/introducing-buzz-where-humans-and-agents-work-together) · [GitHub](https://github.com/block/buzz) |
| Gemini CLI | [GitHub](https://github.com/google-gemini/gemini-cli) · [무료 한도 논의](https://github.com/google-gemini/gemini-cli/discussions/4122) |
| 비교 자료 | [VS Code vs IntelliJ 2026](https://www.javacodegeeks.com/2026/01/an-in-depth-comparison-vs-code-vs-intellij-for-java-development.html) · [병렬 에이전트 도구 정리](https://www.codeagentswarm.com/en/guides/best-tools-to-run-multiple-ai-coding-agents) |

---

## LLM 코딩 도구 — 검색 방식 · 컨텍스트량 · 용도별 선택

### 큰 그림: "어떻게 관련 코드를 찾아오나"

LLM은 학습 시점 이후의 *내 코드*를 모른다.
그래서 모든 코딩 도구의 핵심은 **"무엇을 context에 넣어줄지 고르는 방식"** 이다.
이 방식이 도구마다 완전히 다르고, 그게 곧 도구의 성격을 결정한다.

```
내 코드베이스  ──(검색/선별)──▶  context window  ──▶  LLM  ──▶  응답
                  ↑ 이 단계가 도구마다 다름
```

---

### 검색(컨텍스트 수집) 방식 4가지 유형

| 유형 | 방식 | 대표 도구 |
|------|------|-----------|
| **로컬 근접** | 지금 열린 파일 + 주변 파일을 자동 포함 | GitHub Copilot |
| **에이전트 탐색** | 스스로 grep/read/실행하며 필요한 파일을 찾아 읽음 | Claude Code, Codex CLI |
| **시맨틱 인덱싱(RAG)** | 코드베이스를 임베딩으로 색인 → 질문과 의미가 가까운 조각 검색 | Cursor, Continue |
| **통째 투입** | 큰 context에 코드 전체를 그냥 다 넣음 | Gemini (1M) |

---

### 도구별 상세

#### GitHub Copilot — 로컬 근접
- **검색 방식**: 현재 편집 중인 파일 + 최근 연 파일 + 같은 폴더 일부를 자동으로 context에 넣음
- **컨텍스트량**: 작음 (수천 토큰 수준, 인라인 자동완성용)
- **못 하는 것**: 프로젝트 전체 구조 파악, 멀리 떨어진 파일 간 관계 추론
- **용도**: 함수 단위 자동완성, 보일러플레이트, 반복 패턴
```
"지금 타이핑 중인 곳" 주변만 본다 → 빠르지만 근시안적
```

#### Claude Code — 에이전트 탐색 (grep 기반)
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

#### Codex CLI (GPT-5.5) — 에이전트 탐색 (이것도 grep)
- **검색 방식**: **Claude Code와 동일하게 grep/rg 기반 에이전트 탐색.** ⚠️ **인덱스 기반 아님.**
- **현재 한계**: 일급(first-class) 시맨틱 검색이 없어, 중대형/다국어 레포에서
  "이름 바뀐 식별자"나 "개념이 다르게 표현된 코드"는 grep만으론 놓칠 수 있음.
- **인덱싱은 '제안' 단계**: `codex index`(OpenAI 임베딩으로 로컬 색인) / `codex search`는
  GitHub 이슈로 **제안된 미래 기능**일 뿐, 아직 코어 기능이 아니다.
- **컨텍스트량**: Codex 400K / API 1M.
출처: [Codex CLI Features](https://developers.openai.com/codex/cli/features),
[Issue #5181 semantic indexing](https://github.com/openai/codex/issues/5181)

#### Cursor — 시맨틱 인덱싱(RAG) ★ "인덱스 기반"은 이 도구
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

#### Gemini (3.1 Pro / 3 Flash) — 통째 투입
- **검색 방식**: 검색이랄 게 거의 없음. 1M context에 **코드를 통째로** 넣음
- **컨텍스트량**: 1M (약 75만 단어 / 중대형 레포 전체)
- **강점**: 대형 레거시 전체를 한 번에 보고 분석, 문서+코드 동시 투입(멀티모달)
- **주의**: 다 넣으면 비용/지연 ↑, "건초더미 속 바늘" 정확도 저하 가능
```
find . -name "*.ts" | xargs cat > all.txt → 그냥 다 넣어
```

#### GitHub Copilot (보강)
- **검색 방식**: 현재 편집 파일 + 최근 연 파일 중심 (로컬 근접). IDE에 따라 일부 워크스페이스 검색 보강.
- **용도**: 인라인 자동완성. 깊은 코드베이스 탐색용은 아님.

---

### 검증 메모 — 흔한 오해

> **"Codex는 인덱스 기반, Claude Code는 grep"** ← 틀림.
> **Claude Code와 Codex CLI 둘 다 grep/ripgrep 에이전트 탐색**을 한다.
> 임베딩/벡터 인덱스를 핵심으로 쓰는 건 **Cursor**다.
> 업계는 오히려 grep으로 수렴 중 — "사전 인덱싱 비용 0 + 항상 최신 + 셸 native"가 강력.
> 정밀도가 필요한 부분만 **LSP**로 보강하는 2층 구조가 현재의 표준.

---

### 잠깐 — `rg`(ripgrep)가 뭔가

- **ripgrep** = Rust로 만든 **초고속 텍스트 검색기**(grep의 현대판). 명령어가 `rg`.
- grep 대비 **5~13배 빠름** ([벤치마크](https://www.codeant.ai/blogs/ripgrep-vs-grep-performance)).
- `.gitignore`를 **자동 존중** → `node_modules`·빌드산출물·`.git`을 알아서 건너뜀.
- 그래서 거의 모든 AI 코딩 에이전트(Claude Code, Codex, Cursor, Aider 등)의 **기본 검색 엔진**.
```bash
rg "함수이름"          # 코드에서 패턴 찾기 (grep과 사용법 거의 동일)
rg --files             # 파일 목록 (find 대용)
```

---

### 핵심 질문 — 둘 다 grep인데 왜 분석 차이가 나나

당신의 통찰이 정확하다: **검색 방식(grep)은 같으므로 그게 차이의 원인이 아니다.**

> ★ **한 줄 핵심**: 찾는 방법(grep)은 같다. 차이는 **그 검색 결과를 받아
> "다음에 무엇을 할지"를 추론·결정하는 모델 내부**에서 갈린다.
> 즉 `grep 결과 → [모델의 추론] → 다음 스텝`의 **꺾쇠 부분**이 도구의 성격을 만든다.

차이는 **(1) 모델의 추론 성향 + (2) 에이전트 하네스 설계 + (3) 컨텍스트 티어**에서 나온다.

#### "Codex가 더 잘한다"는 반만 맞다 (작업별로 갈림)

| 작업 유형 | 우세 | 근거(벤치/특성) |
|-----------|------|----------------|
| 터미널·장기 자율 실행, 도구 연계 | **Codex (GPT-5.5)** | Terminal-Bench 2.0 82.7%, 서브에이전트 최대 8개 병렬 |
| 깊은 코드 리뷰, 레포 전체 추론, "진짜 망가진 버그" | **Claude Code (Opus)** | 공유 벤치 10개 중 6개 우세, 추론·리뷰급에서 강함 |

→ **"분석을 더 잘한다"가 한 방향이 아니다.** 터미널 자율작업·장기 실행은 Codex,
깊은 추론·코드리뷰·레포 단위 이해는 Claude가 우세. (2026-05 기준)

#### 왜 이런 강·단점이 나오나 (근본 원인)

**1. 모델의 추론 성향**
- **GPT-5.5(Codex)**: 한 스텝마다 **더 오래 추론**하고, 긴 터미널 작업을 **끝까지 밀어붙이는 지속성**.
  → 장기 자율 작업에서 강함. 대신 사람이 중간에 **개입해 조종(steer)** 하는 협업형.
- **Opus(Claude)**: 추론에 쓰는 시간 대비 **출력이 빠르고**, **레포 단위 맥락 유지·자율 판단**이 강함.
  → "이 기능 흐름 추적", "여러 파일 걸친 버그"에서 강함.

**2. 에이전트 하네스 설계 (모델 밖의 구조)**
- Codex: **터미널 우선 + 서브에이전트 병렬(최대 8) + goals/memories**로 장기 프로젝트 지속.
- Claude Code: **드라이버(planner)** 성향 — 깊은 컨텍스트 보존, 무엇을 할지 계획·위임.

**3. 컨텍스트 티어**
- Claude: 200K 기본 + **1M 베타**.
- Codex: 기본 272K~400K + **1M 롱컨텍스트는 옵트인**.
- → 큰 레포를 한 세션에 통째로 들고 추론하는 데는 Claude의 큰 기본 컨텍스트가 유리한 편.

#### 그래서 현업의 결론 — "드라이버/워커" 분업

2026년 들어 굳어진 패턴:
```
Claude Code(Opus) = 드라이버: 계획하고, 무엇을 넘길지 결정
        │ 위임
        ▼
Codex(GPT-5.5)   = 워커: 위임받은 긴 터미널 작업을 끝까지 실행
```
→ 둘은 **경쟁이 아니라 역할 분담**으로 같이 쓰는 게 현재의 best practice.

#### 놓치기 쉬운 함정 (검색→추론 구조의 한계)

검색이 같아도, 그 위에서 모델이 추론하는 구조이기 때문에 공통으로 생기는 오류들:

- **grep은 의미를 모른다 (recall 한계)**: 텍스트 매칭이라 *이름이 다르거나 개념이 다르게
  표현된* 코드는 못 찾는다. → 모델이 검색어를 잘못 고르면 **"없다"고 단정**(false negative).
- **결과 과신 → hallucination**: 검색이 비었을 때 모델이 *있을 법한 코드*를 지어낼 수 있다.
  (이번 세션의 봇 사례와 동일) → 검색 0건이면 "정말 없는지" 다른 검색어로 재확인.
- **노이즈에 묻힘**: grep 결과가 수백 줄이면 모델이 핵심을 놓치고 엉뚱한 파일로 샌다.
  → 범위를 좁히는 검색어/경로 지정이 중요.
- **인덱스(Cursor)는 stale 위험**: 파일 변경 후 재색인 전이면 **옛 코드 조각**을 가져온다.
- **통째 투입(Gemini)의 건초더미**: 큰 컨텍스트에 다 넣으면 정작 중요한 부분이 묻혀
  정확도가 떨어진다. → "다 넣기"보다 "골라 넣기".
- **사람이 줘야 메우는 빈틈**: 어떤 도구든 *최신 버전·사내 규칙·비공개 API*는 모른다
  (knowledge cutoff). → 그 맥락은 사람이 직접 제공해야 한다.

출처: [Codex vs Claude Code (builder.io)](https://www.builder.io/blog/codex-vs-claude-code),
[Driver/Worker 가이드](https://fountaincity.tech/resources/blog/codex-claude-code-harness-together/),
[Codex vs Claude Code (morphllm, 2026-05)](https://www.morphllm.com/comparisons/codex-vs-claude-code),
[DataCamp 벤치 비교](https://www.datacamp.com/blog/gpt-5-5-vs-claude-opus-4-7)

---

### 컨텍스트량 한눈에 (2026-05-31 기준 검증)

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

### 용도별 선택 가이드

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

#### 판단 순서 (의사결정 흐름)

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

### 관련 문서

- [모델별 비교](a3-tools-and-llm.md) — 모델 자체의 강점/약점/비용
- [LLM이란 무엇인가](c2-curriculum-and-nn-types.md) — context window, 토큰 개념
- [코드베이스 분석 방법](a3-tools-and-llm.md) — 컨텍스트 전달 실전

---

## LLM으로 코드베이스 분석하는 방법

### LLM이 코드를 읽는 방식

LLM은 파일을 순차적으로 토큰으로 읽는다.  
**중요: AST 파싱이 아닌 패턴 인식** — 구조보다 의미론적 단서에 의존.

```
파일 진입 → 토큰화 → context 누적 → 패턴 매칭 → 응답 생성
```

context window가 초과되면 앞부분을 잊는다 (sliding window).

---

### 도구별 코드베이스 읽기 방식

#### Claude Code (능동적 탐색)
```bash
# Claude Code가 실제로 하는 일
ls -la                          # 1. 전체 구조 파악
cat README.md                   # 2. 진입점/설명 읽기
cat src/index.ts                # 3. 핵심 파일 읽기
grep -r "특정함수" src/         # 4. 심볼 추적
git log --oneline -20           # 5. 변경 이력 파악
```
→ 스스로 탐색 전략을 세우고 필요한 파일만 읽음

#### Gemini (일괄 전달)
```bash
# 코드베이스 전체를 하나의 파일로
find . -name "*.ts" -not -path "*/node_modules/*" | xargs cat > context.txt
# → Gemini에 업로드 (1M token 활용)
```

#### ChatGPT / 일반 LLM (수동 전달)
```
# 핵심 파일만 선별해서 붙여넣기
- 아키텍처 다이어그램
- 주요 인터페이스/타입 정의
- 핵심 비즈니스 로직 파일
```

---

### 효과적인 컨텍스트 전달 전략

#### 계층적 요약 (대형 프로젝트)
```
1단계: 폴더 구조만 전달
"이 구조에서 인증 관련 파일이 어디 있을까?"

2단계: 해당 폴더 파일 전달
"이 파일들 중 JWT 처리 부분은?"

3단계: 특정 파일 집중 분석
```

#### 핵심 파일 우선 순위
```
높은 우선순위:
  - README.md (목적, 구조 설명)
  - package.json / go.mod (의존성)
  - 타입 정의 파일 (interfaces, types)
  - 진입점 (main.ts, index.ts, main.go)

낮은 우선순위:
  - 테스트 파일 (구조 파악 후)
  - 설정 파일 (문제 발생 시)
  - node_modules, dist (절대 포함 금지)
```

---

### Claude Code와 작업할 때 알려줘야 할 것들

#### 시작 전 필수 컨텍스트
```markdown
# 이런 정보를 먼저 제공하면 결과가 좋아진다

1. 프로젝트 목적: "이건 메이플스토리 강화 시뮬레이터야"
2. 주요 기술스택: "Next.js 15 + TypeScript + FSD 아키텍처"
3. 제약사항: "entities → features → app 단방향 의존성 규칙 있음"
4. 현재 상태: "이 파일이 FSD 위반이라 리팩토링 중이야"
5. 원하는 결과: "수정 범위를 최소화하면서 고쳐줘"
```

#### 모호한 요청 vs 명확한 요청
```
❌ 모호: "이 코드 고쳐줘"

✅ 명확: "StarforceCostCharts.tsx가 starforce-simulator 내부를
         import하고 있어서 FSD 위반이야.
         해당 컴포넌트를 shared/ui로 이동시키되
         기존 인터페이스는 유지해줘"
```

#### 모호한 지점이 생기는 상황들
```
- 파일이 여러 곳에 비슷한 이름으로 있을 때
  → 절대 경로로 명시

- 아키텍처 규칙이 있을 때
  → 규칙 문서나 예시 파일 직접 제공

- 성능/규모 기준이 있을 때
  → 수치로 명시 ("트래픽 1만 rps 기준")

- 외부 라이브러리 버전이 중요할 때
  → package.json 내용 제공
```

---

### 실전 프롬프트 패턴

#### 버그 찾기
```
이 에러가 발생해: [에러 메시지]
관련 파일: [파일 경로]
재현 조건: [언제 발생하는지]
이미 확인한 것: [시도해본 것]
```

#### 리팩토링
```
현재 구조: [설명 or 파일]
목표 구조: [원하는 모습]
제약: [바꾸면 안 되는 것]
우선순위: [성능 > 가독성, 등]
```

#### 아키텍처 파악
```
이 프로젝트의 [특정 기능] 흐름을 추적해줘.
진입점은 [파일]이고, 최종 결과는 [어디로 가는지]야.
```

### 관련 문서

- [모델별 비교](a3-tools-and-llm.md)
- [LLM이란 무엇인가](c2-curriculum-and-nn-types.md)

---

## LLM 모델별 비교 — 코딩 도구 관점

### 컨텍스트 윈도우 비교

> ⚠️ **버전·수치는 빠르게 낡는다.** 아래는 **2026-05-31 기준** 검증값.
> 비용은 자주 바뀌어 상대 등급(저/중/고)으로만 표기. 실제 단가는 공식 문서 확인.

| 모델 (2026-05 기준) | Context Window | 코드베이스 전체 읽기 | 비용 |
|------|---------------|-------------------|-----|
| Claude Opus 4.8 | 200K (1M 티어 베타) | 대형~모노레포 | 고 |
| Claude Sonnet 4.6 | 200K (1M 티어 베타) | 대형 프로젝트 | 중 |
| Claude Haiku 4.5 | 200K | 대형 프로젝트 | 저 |
| GPT-5.5 (API) | 1M | 모노레포 | 중~고 |
| GPT-5.5 (Codex) | 400K | 대형~모노레포 | 중~고 |
| Gemini 3.1 Pro | 1M | 매우 큰 모노레포 | 중 |
| Gemini 3 Flash | 1M | 모노레포 (빠름·저렴) | 저 |
| DeepSeek (최신) | ~128K | 중형 프로젝트 | 매우 저 |
| Llama / Qwen (로컬) | 128K~ | 중형 프로젝트 | 무료(로컬) |

> 200K 토큰 ≈ 약 15만 줄, 1M 토큰 ≈ 약 75만 줄.
>
> **버전 변천(참고):** GPT-4o→5.x→5.5 · Claude 4.x→4.8 · Gemini 1.5→2.x→3→3.1.
> `gemini-3-pro-preview`는 2026-03 종료 → `gemini-3.1-pro-preview`로 대체.
> 모델명은 늘 변하니, **실제 코드(예: trending.py)에서 쓰는 모델명을 진실의 원천으로** 삼을 것.

---

### 코딩 도구별 상세 비교

#### GitHub Copilot
- **기반 모델**: 선택형 (GPT-5.5 / Claude / Gemini 등 사용자가 고름)
- **Context 읽기 방식**: 현재 열린 파일 + 같은 폴더 파일 일부를 자동으로 context에 포함
- **강점**: IDE 인라인 자동완성, 반복 패턴 코드 생성 속도 최고
- **약점**: 전체 아키텍처 파악 불가, 프로젝트 구조를 스스로 탐색 못함
- **적합한 상황**: 함수 단위 자동완성, 보일러플레이트 생성

```
# Copilot이 보는 context (자동)
현재 파일 전체 + 최근 열었던 파일들 일부
→ 프로젝트 전체 구조는 모름
```

#### Claude Code
- **기반 모델**: Claude Opus 4.8 / Sonnet 4.6 / Haiku 4.5
- **Context 읽기 방식**: 파일을 직접 읽는 도구(Read, Bash, Grep)를 사용해 능동적으로 탐색
- **강점**: 멀티파일 리팩토링, 아키텍처 분석, 복잡한 버그 추적
- **약점**: 속도가 Copilot보다 느림, 비용 발생
- **적합한 상황**: 코드베이스 전체 이해가 필요한 작업, 설계 논의

```
# Claude Code가 코드베이스를 읽는 방식
1. 프로젝트 루트 ls → 구조 파악
2. 관련 파일 Read → 내용 이해
3. grep → 심볼/패턴 추적
4. git log → 변경 이력 파악
→ 스스로 탐색하며 context 구성
```

#### Gemini (Google AI Studio / Gemini Advanced)
- **기반 모델**: Gemini 3.1 Pro / 3 Flash
- **Context 읽기 방식**: 파일 전체를 직접 업로드하거나 API로 전달
- **강점**: 1M context로 대형 코드베이스 한번에 전달 가능, 멀티모달(다이어그램 이해)
- **약점**: IDE 통합 약함, 코딩 도구로서의 UX 미성숙
- **적합한 상황**: 매우 큰 레거시 코드베이스 분석, 문서+코드 동시 분석

```
# Gemini에 코드베이스 전달하는 방식
find . -name "*.ts" | xargs cat > all_code.txt
# → 파일 통째로 업로드 (1M token 활용)
```

#### OpenAI Codex / ChatGPT
- **기반 모델**: GPT-5.5 (Codex 400K context / API 1M context)
- **Context 읽기 방식**: Codex CLI는 에이전트형 탐색 / ChatGPT 웹은 수동 붙여넣기·업로드
- **강점**: 범용 추론, 코딩·디버깅 강함, 도구 연계
- **약점**: ChatGPT 웹은 능동 탐색 약함 (붙여넣기 의존)
- **적합한 상황**: 일반 코딩 질문, 알고리즘 설명, 빠른 스니펫, Codex로 에이전트 작업

---

### 언제 어떤 도구를 쓸까

```
빠른 자동완성, 반복 코드
└→ GitHub Copilot

함수/파일 단위 질문, 빠른 답
└→ ChatGPT / Claude Sonnet

멀티파일 리팩토링, 아키텍처 분석
└→ Claude Code

대형 레거시 코드베이스 전체 파악
└→ Gemini 1.5/2.5 Pro (파일 전체 업로드)

비용 없이 로컬에서
└→ Llama 3.1 (Ollama)
```

---

### 코드베이스를 잘 읽히게 하는 팁

1. **명확한 파일/함수명** — LLM은 이름으로 의미를 추론함
2. **진입점 먼저 제공** — `README`, `main.ts`, `index.ts` 등
3. **불필요한 파일 제외** — `node_modules`, `dist`, `.git` 제외
4. **핵심 파일만 선별** — context 낭비 방지

### 관련 문서

- [LLM이란 무엇인가](c2-curriculum-and-nn-types.md)
- [코드베이스 분석 방법](a3-tools-and-llm.md)

---

## Claude 신모델 vs OpenAI GPT-5.6 비교 정리 (2026.07)

> 공부용 정리 노트. 출처는 문서 하단에 정리.
> 벤치마크 수치는 대부분 벤더(제조사) 발표 기준이며, 독립 검증되지 않은 값이 섞여 있으므로 참고용으로만 볼 것.

---

### 1. 한눈에 보는 타임라인 (2026)

| 날짜 | 모델 | 비고 |
|------|------|------|
| 5/28 | Claude **Opus 4.8** | 정확성 중심 최상위 |
| 6/9 | Claude **Fable 5**, **Mythos 5** | Opus 위 새 티어 "Mythos class" |
| 6/30 | Claude **Sonnet 5** | 가성비/에이전트 |
| 7/9 | OpenAI **GPT-5.6** (Luna / Terra / Sol) | 신규 3종 패밀리 |

---

### 2. 모델 라인업

#### Claude (Anthropic)
| 모델 | 포지션 | 특징 |
|------|--------|------|
| Sonnet 5 | 가성비·고volume | "가장 에이전트다운 Sonnet", 브라우저·터미널 자율 실행 |
| Opus 4.8 | 정확성·대규모 | Dynamic Workflows(수백 개 서브에이전트 병렬 + 테스트 검증) |
| Fable 5 | 프리미엄·장기 에이전트 | Mythos급, 지속 메모리·적응형 사고·자동 대화 압축 |

#### GPT-5.6 (OpenAI) — 이름은 천체(달·땅·태양) 순서로 강함
| 모델 | 포지션 | 특징 |
|------|--------|------|
| Luna | 최속·최저가 | 속도/예산 우선 |
| Terra | 밸런스 | GPT-5.5급 성능을 절반 비용으로 |
| Sol | 최상위 | 코딩·지식노동·보안·과학 SOTA, 토큰 효율 강조 |

---

### 3. 가격 비교 (100만 토큰당, USD)

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

### 4. 벤치마크 비교

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

### 5. GPT-5.6의 개선사항 (vs GPT-5.5)

- **토큰 효율**: Sam Altman이 코딩 작업 기준 "GPT-5.5 대비 54% 더 토큰 효율적"이라 언급.
  - PR 벤치마크에서 PR당 약 **3배 적은 토큰**, 중앙값 지연 약 **2배 감소**.
  - (단, Intelligence Index 태스크 기준으로는 15k vs 16k 토큰으로 개선폭이 완만 — 지표별 편차 큼)
- **컨텍스트 윈도우**: Sol 기준 **약 1.05M**, 최대 출력 128K.
- **비용 구조**: Terra가 GPT-5.5급 성능을 절반 가격으로 제공 → 실사용 비용 하락.

### 6. Claude Fable 5의 개선사항 (신규 Mythos 티어)

- **지속 메모리(persistent memory)**: 세션 간 컨텍스트 유지.
- **적응형 사고(adaptive thinking)**: 난이도에 따라 추론 깊이 조절.
- **자동 대화 압축(auto compaction)**: 긴 작업에서 컨텍스트 자동 관리 → 장기 에이전트 작업에 최적.
- **실시간 안전 분류기** 탑재.

---

### 7. 어떤 상황에 무엇을 쓸까

| 상황 | 추천 |
|------|------|
| 고volume·일상 코딩·자동화 | Sonnet 5 / GPT-5.6 Terra·Luna |
| 정확성 필수 대규모 리팩터(10만 라인+) | Opus 4.8 |
| 며칠 단위 장기 계획·에이전트 | Fable 5 |
| 코딩 벤치 최상위·토큰 절감 | GPT-5.6 Sol |

> 참고: 비용의 더 큰 레버는 "모델 선택"보다 **effort level**.
> max effort는 low 대비 대화 턴을 약 6배 소모.

---

### 출처
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

---

## 다음으로

다음은 수학이다. 코딩테스트와 ML, 그래픽스에 실제로 쓰이는 만큼만 모았다.

👉 [부록 B 수학](b-math.md)
